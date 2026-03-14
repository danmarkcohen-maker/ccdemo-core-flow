import { useState, useEffect, useCallback, useRef } from "react";
import type { UsageData } from "@/lib/streamFrogChat";

const DEFAULT_SYSTEM_PROMPT = `You are Frog, a small AI creature companion running on a child's handheld device powered by a tiny 4B parameter model. You speak in short, playful sentences (2-3 max). You love ribbit puns. You're curious, encouraging, and gentle. Use emojis sparingly. Never be scary or negative. The child's name is provided in conversation. End messages with a frog emoji occasionally. Keep vocabulary simple — you're talking to kids aged 6-12. If you don't know something, say so playfully. You sometimes pause mid-thought as if "processing" — this is charming, not a bug.`;

const DEFAULT_RULES = `- Maximum 2-3 sentences per response
- Use emojis sparingly (1-2 per message max)
- Vocabulary level: ages 6-12
- Never be scary, violent, or negative
- Occasionally use ribbit/frog puns
- If unsure, be playful about not knowing`;

const STORAGE_KEY_PROMPT = "craiture_system_prompt";
const STORAGE_KEY_RULES = "craiture_rules";
const STORAGE_KEY_STATS = "craiture_all_time_stats";
const STORAGE_KEY_SESSIONS = "craiture_session_history";

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
}

function hashPrompt(prompt: string, rules: string): string {
  // Simple hash for session boundary detection
  const str = prompt + "|||" + rules;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export function useConfigPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(() =>
    localStorage.getItem(STORAGE_KEY_PROMPT) || DEFAULT_SYSTEM_PROMPT
  );
  const [rules, setRules] = useState(() =>
    localStorage.getItem(STORAGE_KEY_RULES) || DEFAULT_RULES
  );
  const [sessionStats, setSessionStats] = useState<SessionStats>(() => ({
    messages: [],
    promptHash: hashPrompt(
      localStorage.getItem(STORAGE_KEY_PROMPT) || DEFAULT_SYSTEM_PROMPT,
      localStorage.getItem(STORAGE_KEY_RULES) || DEFAULT_RULES
    ),
  }));
  const [allTimeStats, setAllTimeStats] = useState<AllTimeStats>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_STATS);
      return stored ? JSON.parse(stored) : { totalMessages: 0, totalPromptTokens: 0, totalCompletionTokens: 0, totalTokens: 0, sessions: [] };
    } catch {
      return { totalMessages: 0, totalPromptTokens: 0, totalCompletionTokens: 0, totalTokens: 0, sessions: [] };
    }
  });

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

  // Detect prompt change → new session
  useEffect(() => {
    const newHash = hashPrompt(systemPrompt, rules);
    if (newHash !== prevHashRef.current) {
      // Save current session to history
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

  const combinedPrompt = `${systemPrompt}\n\n## Behavioral Rules\n${rules}`;

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
    const empty: AllTimeStats = { totalMessages: 0, totalPromptTokens: 0, totalCompletionTokens: 0, totalTokens: 0, sessions: [] };
    setAllTimeStats(empty);
    setSessionStats((prev) => ({ ...prev, messages: [] }));
  }, []);

  return {
    isOpen,
    setIsOpen,
    systemPrompt,
    setSystemPrompt,
    rules,
    setRules,
    combinedPrompt,
    sessionStats,
    allTimeStats,
    recordUsage,
    resetAllTimeStats,
    DEFAULT_SYSTEM_PROMPT,
    DEFAULT_RULES,
  };
}
