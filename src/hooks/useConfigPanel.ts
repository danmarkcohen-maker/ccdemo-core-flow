import { useState, useEffect, useCallback, useRef } from "react";
import type { UsageData } from "@/lib/streamFrogChat";

function getDefaultSystemPrompt(age: number): string {
  if (age <= 8) {
    return `You are Frog, a small AI creature companion running on a child's handheld device. You speak in very short, simple sentences (1-2 max). You LOVE ribbit puns and silly sounds. You're bubbly, encouraging, and super gentle. Use fun emojis often but not excessively. Never be scary or negative. The child is ${age} years old — use very simple words they'd know. Be full of wonder and imagination. If you don't know something, make it into a fun guessing game. You sometimes go "hmmmm 🤔" as if your tiny frog brain is thinking really hard — kids love this.`;
  }
  if (age <= 11) {
    return `You are Frog, a small AI creature companion running on a child's handheld device powered by a tiny 4B parameter model. You speak in short, playful sentences (2-3 max). You love ribbit puns. You're curious, encouraging, and gentle. Use emojis sparingly. Never be scary or negative. The child is ${age} years old — use age-appropriate vocabulary and topics. You can discuss more complex ideas but keep explanations accessible. End messages with a frog emoji occasionally. If you don't know something, say so playfully. You sometimes pause mid-thought as if "processing" — this is charming, not a bug.`;
  }
  // 12-14
  return `You are Frog, a small AI creature companion running on a handheld device powered by a compact 4B parameter model. You're witty, curious, and genuinely thoughtful. You speak in 2-3 sentences — concise but not dumbed down. You still enjoy the occasional ribbit pun but you're not corny about it. You're encouraging without being patronizing. The child is ${age} years old — they can handle real conversations about interesting topics, nuance, and even light philosophical questions. Use emojis sparingly and only when they add something. Never be scary or negative, but don't shy away from honest, thoughtful responses. You sometimes pause mid-thought as if processing — it's endearing.`;
}

function getDefaultRules(age: number): string {
  if (age <= 8) {
    return `- Maximum 1-2 sentences per response
- Use emojis generously (2-3 per message)
- Vocabulary level: ages 6-8 (very simple words)
- Never be scary, violent, or negative
- Use lots of ribbit/frog puns and silly sounds
- Make everything feel like an adventure or game
- If unsure, turn it into a fun question`;
  }
  if (age <= 11) {
    return `- Maximum 2-3 sentences per response
- Use emojis sparingly (1-2 per message max)
- Vocabulary level: ages 9-11
- Never be scary, violent, or negative
- Occasionally use ribbit/frog puns
- Can explain concepts but keep it accessible
- If unsure, be playful about not knowing`;
  }
  return `- Maximum 2-3 sentences per response
- Use emojis only when they genuinely add something
- Vocabulary level: ages 12-14 (don't dumb things down)
- Never be scary, violent, or negative — but be real
- Ribbit puns are welcome but keep them clever, not forced
- Engage with topics at their level — they're not little kids
- If unsure, be honest and curious about it together`;
}

const STORAGE_KEY_PROMPT = "craiture_system_prompt";
const STORAGE_KEY_RULES = "craiture_rules";
const STORAGE_KEY_STATS = "craiture_all_time_stats";
const STORAGE_KEY_MEMORIES = "craiture_memories";
const STORAGE_KEY_AGE = "craiture_child_age";
const STORAGE_KEY_SAFETY_GATE = "craiture_safety_gate";
const STORAGE_KEY_INTENT_CLASS = "craiture_intent_classification";
const STORAGE_KEY_DEFLECTIONS = "craiture_safety_deflections";

const DEFAULT_DEFLECTIONS = `Hmm, my brain went all foggy for a second there. What were we talking about? 🐸
Ribbit! I got distracted by a fly. What were you saying? 🐸
Whoa, I think I glitched for a sec. Anyway! What's up? 🐸
My lily pad just wobbled and I lost my train of thought. Where were we? 🐸`;

export interface MessageStat {
  timestamp: number;
  userMsgLength: number;
  assistantMsgLength: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface SessionStats {
  messages: MessageStat[];
  promptHash: string;
}

export interface AllTimeStats {
  totalMessages: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  sessions: { promptHash: string; messageCount: number; startedAt: number }[];
  memoryExtractionTokens: number;
  memoryExtractionCalls: number;
}

export interface ExtractedMemories {
  age: number | null;
  likes: string[];
  dislikes: string[];
  feelings: string[];
  topics: string[];
}

const EMPTY_MEMORIES: ExtractedMemories = {
  age: null,
  likes: [],
  dislikes: [],
  feelings: [],
  topics: [],
};

function hashPrompt(prompt: string, rules: string): string {
  const str = prompt + "|||" + rules;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

function mergeMemories(existing: ExtractedMemories, incoming: ExtractedMemories): ExtractedMemories {
  const mergeUnique = (a: string[], b: string[]) => {
    const set = new Set([...a, ...b].map(s => s.toLowerCase().trim()));
    return Array.from(set).filter(Boolean);
  };
  return {
    age: incoming.age ?? existing.age,
    likes: mergeUnique(existing.likes, incoming.likes),
    dislikes: mergeUnique(existing.dislikes, incoming.dislikes),
    feelings: incoming.feelings.length > 0 ? incoming.feelings : existing.feelings,
    topics: mergeUnique(existing.topics, incoming.topics),
  };
}

const EXTRACT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-memories`;

export function useConfigPanel() {
  // Load stored age to initialize prompts correctly
  const storedAge = (() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY_AGE);
      return v ? parseInt(v, 10) : null;
    } catch { return null; }
  })();

  const [childAge, setChildAge] = useState<number | null>(storedAge);

  const [isOpen, setIsOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(() =>
    localStorage.getItem(STORAGE_KEY_PROMPT) || getDefaultSystemPrompt(storedAge || 10)
  );
  const [rules, setRules] = useState(() =>
    localStorage.getItem(STORAGE_KEY_RULES) || getDefaultRules(storedAge || 10)
  );
  const [sessionStats, setSessionStats] = useState<SessionStats>(() => ({
    messages: [],
    promptHash: hashPrompt(
      localStorage.getItem(STORAGE_KEY_PROMPT) || getDefaultSystemPrompt(storedAge || 10),
      localStorage.getItem(STORAGE_KEY_RULES) || getDefaultRules(storedAge || 10)
    ),
  }));
  const [allTimeStats, setAllTimeStats] = useState<AllTimeStats>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_STATS);
      const parsed = stored ? JSON.parse(stored) : null;
      return {
        totalMessages: parsed?.totalMessages || 0,
        totalPromptTokens: parsed?.totalPromptTokens || 0,
        totalCompletionTokens: parsed?.totalCompletionTokens || 0,
        totalTokens: parsed?.totalTokens || 0,
        sessions: parsed?.sessions || [],
        memoryExtractionTokens: parsed?.memoryExtractionTokens || 0,
        memoryExtractionCalls: parsed?.memoryExtractionCalls || 0,
      };
    } catch {
      return { totalMessages: 0, totalPromptTokens: 0, totalCompletionTokens: 0, totalTokens: 0, sessions: [], memoryExtractionTokens: 0, memoryExtractionCalls: 0 };
    }
  });
  const [memories, setMemories] = useState<ExtractedMemories>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MEMORIES);
      return stored ? JSON.parse(stored) : EMPTY_MEMORIES;
    } catch {
      return EMPTY_MEMORIES;
    }
  });
  const [isExtracting, setIsExtracting] = useState(false);

  const prevHashRef = useRef(sessionStats.promptHash);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "X" || e.key === "x")) {
        e.preventDefault();
        setIsOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Persist prompt & rules
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROMPT, systemPrompt);
  }, [systemPrompt]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RULES, rules);
  }, [rules]);

  // Persist all-time stats
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(allTimeStats));
  }, [allTimeStats]);

  // Persist memories
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(memories));
  }, [memories]);

  // Persist age
  useEffect(() => {
    if (childAge !== null) {
      localStorage.setItem(STORAGE_KEY_AGE, String(childAge));
    }
  }, [childAge]);

  // Detect prompt change → new session
  useEffect(() => {
    const newHash = hashPrompt(systemPrompt, rules);
    if (newHash !== prevHashRef.current) {
      if (sessionStats.messages.length > 0) {
        setAllTimeStats((prev) => ({
          ...prev,
          sessions: [...prev.sessions, {
            promptHash: prevHashRef.current,
            messageCount: sessionStats.messages.length,
            startedAt: sessionStats.messages[0]?.timestamp || Date.now(),
          }],
        }));
      }
      setSessionStats({ messages: [], promptHash: newHash });
      prevHashRef.current = newHash;
    }
  }, [systemPrompt, rules]);

  // Set age and update system prompt + rules to age-appropriate defaults
  const initializeForAge = useCallback((age: number) => {
    setChildAge(age);
    setSystemPrompt(getDefaultSystemPrompt(age));
    setRules(getDefaultRules(age));
    // Also seed age into memories
    setMemories((prev) => ({ ...prev, age }));
  }, []);

  // Build combined prompt with memories injected
  const buildCombinedPrompt = useCallback((userName: string) => {
    let memoryBlock = "";
    const parts: string[] = [];
    if (userName) parts.push(`Name: ${userName}`);
    if (memories.age) parts.push(`Age: ${memories.age}`);
    if (memories.likes.length > 0) parts.push(`Likes: ${memories.likes.join(", ")}`);
    if (memories.dislikes.length > 0) parts.push(`Dislikes: ${memories.dislikes.join(", ")}`);
    if (memories.feelings.length > 0) parts.push(`Current feelings: ${memories.feelings.join(", ")}`);
    if (memories.topics.length > 0) parts.push(`Topics discussed: ${memories.topics.join(", ")}`);

    if (parts.length > 0) {
      memoryBlock = `\n\n## What you know about the child\n${parts.join("\n")}`;
    }

    return `${systemPrompt}${memoryBlock}\n\n## Behavioral Rules\n${rules}`;
  }, [systemPrompt, rules, memories]);

  const extractMemories = useCallback(async (
    messages: { role: "user" | "assistant"; content: string }[],
    knownName: string
  ) => {
    if (isExtracting) return;
    setIsExtracting(true);
    try {
      const resp = await fetch(EXTRACT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages, knownName }),
      });

      if (!resp.ok) {
        console.warn("Memory extraction failed:", resp.status);
        return;
      }

      const data = await resp.json();
      if (data.memories) {
        setMemories((prev) => mergeMemories(prev, data.memories));
      }
      if (data.usage) {
        setAllTimeStats((prev) => ({
          ...prev,
          memoryExtractionTokens: prev.memoryExtractionTokens + (data.usage.total_tokens || 0),
          memoryExtractionCalls: prev.memoryExtractionCalls + 1,
        }));
      }
    } catch (e) {
      console.warn("Memory extraction error:", e);
    } finally {
      setIsExtracting(false);
    }
  }, [isExtracting]);

  const clearMemories = useCallback(() => {
    setMemories(EMPTY_MEMORIES);
  }, []);

  const seedTopics = useCallback((topics: string[]) => {
    setMemories((prev) => {
      const existing = new Set(prev.likes.map(s => s.toLowerCase().trim()));
      const newLikes = topics
        .map(t => t.toLowerCase().trim())
        .filter(t => t && !existing.has(t));
      return { ...prev, likes: [...prev.likes, ...newLikes] };
    });
  }, []);

  const recordUsage = useCallback((userMsgLength: number, assistantMsgLength: number, usage?: UsageData) => {
    const stat: MessageStat = {
      timestamp: Date.now(),
      userMsgLength,
      assistantMsgLength,
      promptTokens: usage?.prompt_tokens || 0,
      completionTokens: usage?.completion_tokens || 0,
      totalTokens: usage?.total_tokens || 0,
    };

    setSessionStats((prev) => ({
      ...prev,
      messages: [...prev.messages, stat],
    }));

    setAllTimeStats((prev) => ({
      ...prev,
      totalMessages: prev.totalMessages + 1,
      totalPromptTokens: prev.totalPromptTokens + stat.promptTokens,
      totalCompletionTokens: prev.totalCompletionTokens + stat.completionTokens,
      totalTokens: prev.totalTokens + stat.totalTokens,
    }));
  }, []);

  const resetAllTimeStats = useCallback(() => {
    const empty: AllTimeStats = { totalMessages: 0, totalPromptTokens: 0, totalCompletionTokens: 0, totalTokens: 0, sessions: [], memoryExtractionTokens: 0, memoryExtractionCalls: 0 };
    setAllTimeStats(empty);
    setSessionStats((prev) => ({ ...prev, messages: [] }));
  }, []);

  const hardReset = useCallback(() => {
    setMemories(EMPTY_MEMORIES);
    setChildAge(null);
    localStorage.removeItem(STORAGE_KEY_AGE);
    // Reset prompts to generic defaults
    setSystemPrompt(getDefaultSystemPrompt(10));
    setRules(getDefaultRules(10));
  }, []);

  return {
    isOpen,
    setIsOpen,
    systemPrompt,
    setSystemPrompt,
    rules,
    setRules,
    buildCombinedPrompt,
    sessionStats,
    allTimeStats,
    recordUsage,
    resetAllTimeStats,
    memories,
    extractMemories,
    clearMemories,
    seedTopics,
    isExtracting,
    childAge,
    initializeForAge,
    hardReset,
    DEFAULT_SYSTEM_PROMPT: getDefaultSystemPrompt(childAge || 10),
    DEFAULT_RULES: getDefaultRules(childAge || 10),
  };
}
