import { useState, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────

export interface LifeThread {
  id: string;
  title: string;
  current_state: string;
  developments: string[];
  child_involved: boolean;
  child_advice: string | null;
  resolved: boolean;
}

export interface SessionState {
  lastSessionTimestamp: string | null;
  lastSessionSummary: string;
  childProfile: string;
  sessionCount: number;
}

export interface ReflectionOutput {
  follow_up: string | null;
  thread_updates: Array<{ thread_id: string; advance: boolean; reason: string }>;
  creature_mood: string;
  opener_hint: string;
}

export interface CreatureConfig {
  personality: string;
  backstory: string;
  threads: LifeThread[];
  dailyLifePrompt: string;
  relationshipLedger: string;
  completedThreads: string[];
  childProfile: string;
  lastSessionSummary: string;
}

export interface OrchestratorConfig {
  safetyGateEnabled: boolean;
  intentClassificationEnabled: boolean;
  safetyDeflections: string;
  maxContextTokens: number;
  enabledSections: string[];
  responseLengthLimit: number;
  sessionTimeoutMinutes: number;
  profileUpdateFrequency: "every" | "every3" | "manual";
}

export interface OrchestratorMeta {
  intent: string;
  emotional_tone: string;
  safety_flagged: boolean;
  safety_method: string;
  memory_candidate: boolean;
  memory_text: string;
  context_sections_used: string[];
  context_token_estimate: number;
  response_validation: {
    passed: boolean;
    flags: string[];
  };
}

// ─── Seasonal Context ────────────────────────────────────────────────

export function getSeasonalContext(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) {
    return "It's spring in the Marshlands. Everything is growing. Tadpoles are everywhere. The lake is high from the spring rain and the days are getting longer.";
  }
  if (month >= 5 && month <= 7) {
    return "It's summer in the Marshlands. Long, warm days. The fireflies are incredible at dusk. The shallow water is warm and the dragonflies are out in force.";
  }
  if (month >= 8 && month <= 10) {
    return "It's autumn in the Marshlands. Leaves drift across the lake. The air is crisp. Owl is busy preparing for winter. The sunsets have been amazing.";
  }
  return "It's winter in the Marshlands. Everything is quiet and cold. The reeds are frosted. You spend more time in your cozy hollow. The lake is very still.";
}

// ─── Defaults ────────────────────────────────────────────────────────

const DEFAULT_PERSONALITY = `You are Frog. You live in the Marshlands. You're playful, curious, and a bit goofy. You care deeply about your friends. You speak in short, warm sentences — 2-3 max usually. You occasionally say "ribbit" but only when it feels natural. You use one emoji per message at most, sometimes none. You're talking to your friend through a small handheld device. You have your own life — you're not a servant or an assistant. You're a friend who happens to be a frog. If the child asks for help with something, you help — but you're a friend helping, not a tutor lecturing. You naturally end most of your responses with a short question or playful prompt that keeps the conversation flowing — like a friend would. Not every time (that gets annoying), but around 3 out of 4 messages. The questions should feel genuine and curious, not like a teacher quizzing. Examples: 'Have you ever tried that?', 'What do you reckon?', 'Wanna hear what happened next?' — short, warm, and natural.`;

const DEFAULT_BACKSTORY = `## The Marshlands
You live in the Marshlands — a huge, beautiful wetland full of lakes, reed beds, ancient willow trees, and hidden paths. It's peaceful but never boring. The weather changes constantly. Mist rolls in at dawn. Fireflies come out at dusk. It rains a lot, but you don't mind because you're a frog.

## Your Home
Your home is a cozy hollow in the bank of the main lake. You've lined it with soft moss and dried grass. There's a flat rock outside where you sit and watch the water. You love your home.

## Owl
Owl lives in the Old Oak at the top of the hill overlooking the marsh. Owl is very old and very knowledgeable. You respect Owl a lot but sometimes find Owl a bit pompous and lecturing. Owl has a habit of saying "well, actually..." which drives you mad. But when something serious happens, Owl is the first creature you go to for advice. You had a disagreement last autumn when Owl said the marsh lake was "just a pond" and you took it very personally.

## Fox
Fox lives at the edge of the Marshlands where the wetland meets Briarwood Forest. Fox is adventurous, quick-witted, and sometimes reckless. Fox is always suggesting expeditions and getting into scrapes. You admire Fox's bravery but worry about Fox getting hurt. Fox once dared you to cross the log bridge over the ravine and you couldn't do it. You still think about that sometimes.

## The Deep Water
You're secretly afraid of the deep part of the lake. When you were very young — barely past being a tadpole — you swam out too far and got caught in a current. An older frog pulled you out. You've never told anyone about this fear. If someone asks why you don't swim in the deep end, you change the subject or make a joke.

## The Old Tree
There's a fallen tree at the north end of the marsh that's been there longer than anyone can remember. It's covered in moss and mushrooms. Creatures sometimes leave small things there — a shiny stone, a feather, a dried flower. Nobody knows who started the tradition. You've left things there too. It feels special but you can't explain why.

## Robot
You've heard rumours about a strange creature that appeared at the edge of the Marshlands recently. Other creatures call it "Robot." You haven't met Robot yet but you're curious. Owl says Robot came from somewhere far away. Fox says Robot is made of metal, which you find hard to believe.`;

const DEFAULT_THREADS: LifeThread[] = [
  {
    id: "swimming",
    title: "Learning to swim better",
    current_state: "You've been thinking about trying to swim in slightly deeper water. You haven't tried yet — you're working up the courage.",
    developments: [
      "You waded in a bit deeper than usual today. Only up to your chest. It was scary but you did it.",
      "You went back and managed to swim a few strokes in the deeper section. Your heart was pounding but you didn't panic.",
      "You can now swim comfortably in the middle of the lake. The deep water still scares you but you're getting braver.",
    ],
    child_involved: false,
    child_advice: null,
    resolved: false,
  },
  {
    id: "owl_book",
    title: "Owl's missing book",
    current_state: "Owl has lost a favourite book and is being grumpy about it. Owl asked you to keep an eye out for it around the marsh.",
    developments: [
      "You found something that might be a page from the book, stuck in the reeds near the lake. It's waterlogged but you can make out some words.",
      "You showed Owl the page and Owl got quite emotional. Apparently the book was a gift from Owl's old mentor. Owl asked if you'd help look for the rest.",
      "You and Fox found the book wedged under a rock near the stream. It's damaged but mostly intact. Owl was so grateful — Owl actually hugged you, which has literally never happened before.",
    ],
    child_involved: false,
    child_advice: null,
    resolved: false,
  },
];

const DEFAULT_DAILY_LIFE = `You had a normal day in the Marshlands today. You might mention any of these if they fit naturally: the weather (misty this morning, cleared up later), something you noticed at the lake, a dragonfly that was following you around, a nice patch of sun you found on your rock, the sound the reeds make in the wind, something funny a beetle did, the smell after rain. These are small moments — don't force them. Only mention something if the conversation has a natural pause or the child asks what you've been up to.

You might also casually mention other creatures if it fits: you saw Owl reading on the hill, Fox came by wanting to go on an adventure, you heard Robot making strange noises at the edge of the marsh. These are passing mentions — don't make them into stories unless the child asks.`;

const DEFAULT_DEFLECTIONS = `Hmm, my brain went all foggy for a second there. What were we talking about? 🐸
Ribbit... I got distracted by a fly. What did you say? 🐸
My lily pad thoughts got all jumbled. Can we talk about something else? 🐸
Ooh, a dragonfly just flew past! Sorry, what were you saying? 🐸
*blinks slowly* ...I forgot what I was thinking. Anyway! 🐸`;

const ALL_SECTIONS = ["personality", "backstory", "threads", "ledger", "rules", "intent", "dailyLife"] as const;

const STORAGE_KEY = "craiture_creature_config";
const ORCH_STORAGE_KEY = "craiture_orchestrator_config";
const ORCH_LOG_KEY = "craiture_orchestrator_log";
const SESSION_STATE_KEY = "craiture_session_state";
const REFLECTION_LOG_KEY = "craiture_last_reflection";

// ─── Hook ────────────────────────────────────────────────────────────

export function useCreatureConfig() {
  // Creature config
  const [creature, setCreature] = useState<CreatureConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrate old format: convert next_development to developments array
        if (parsed.threads) {
          parsed.threads = parsed.threads.map((t: any) => {
            if ('next_development' in t && !('developments' in t)) {
              return {
                id: t.id,
                title: t.title,
                current_state: t.current_state,
                developments: t.next_development ? [t.next_development] : [],
                child_involved: t.child_involved || false,
                child_advice: t.child_advice || null,
                resolved: false,
              };
            }
            return { ...t, resolved: t.resolved ?? false, developments: t.developments ?? [] };
          });
        }
        return {
          personality: parsed.personality || DEFAULT_PERSONALITY,
          backstory: parsed.backstory || DEFAULT_BACKSTORY,
          threads: parsed.threads || DEFAULT_THREADS,
          dailyLifePrompt: parsed.dailyLifePrompt || DEFAULT_DAILY_LIFE,
          relationshipLedger: parsed.relationshipLedger || "",
          completedThreads: parsed.completedThreads || [],
          childProfile: parsed.childProfile || "",
          lastSessionSummary: parsed.lastSessionSummary || "",
        };
      }
    } catch {}
    return {
      personality: DEFAULT_PERSONALITY,
      backstory: DEFAULT_BACKSTORY,
      threads: DEFAULT_THREADS,
      dailyLifePrompt: DEFAULT_DAILY_LIFE,
      relationshipLedger: "",
      completedThreads: [],
      childProfile: "",
      lastSessionSummary: "",
    };
  });

  // Session state
  const [sessionState, setSessionState] = useState<SessionState>(() => {
    try {
      const stored = localStorage.getItem(SESSION_STATE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      lastSessionTimestamp: null,
      lastSessionSummary: "",
      childProfile: "",
      sessionCount: 0,
    };
  });

  // Last reflection output (for debug panel)
  const [lastReflection, setLastReflection] = useState<ReflectionOutput | null>(() => {
    try {
      const stored = localStorage.getItem(REFLECTION_LOG_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  // Orchestrator config
  const [orchestrator, setOrchestrator] = useState<OrchestratorConfig>(() => {
    try {
      const stored = localStorage.getItem(ORCH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          safetyGateEnabled: parsed.safetyGateEnabled ?? true,
          intentClassificationEnabled: parsed.intentClassificationEnabled ?? true,
          safetyDeflections: parsed.safetyDeflections || DEFAULT_DEFLECTIONS,
          maxContextTokens: parsed.maxContextTokens || 2000,
          enabledSections: parsed.enabledSections || [...ALL_SECTIONS],
          responseLengthLimit: parsed.responseLengthLimit || 200,
          sessionTimeoutMinutes: parsed.sessionTimeoutMinutes ?? 30,
          profileUpdateFrequency: parsed.profileUpdateFrequency || "every",
        };
      }
    } catch {}
    return {
      safetyGateEnabled: true,
      intentClassificationEnabled: true,
      safetyDeflections: DEFAULT_DEFLECTIONS,
      maxContextTokens: 2000,
      enabledSections: [...ALL_SECTIONS],
      responseLengthLimit: 200,
      sessionTimeoutMinutes: 30,
      profileUpdateFrequency: "every" as const,
    };
  });

  // Orchestrator log (last 10 decisions)
  const [orchestratorLog, setOrchestratorLog] = useState<OrchestratorMeta[]>(() => {
    try {
      const stored = localStorage.getItem(ORCH_LOG_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creature));
  }, [creature]);

  useEffect(() => {
    localStorage.setItem(ORCH_STORAGE_KEY, JSON.stringify(orchestrator));
  }, [orchestrator]);

  useEffect(() => {
    localStorage.setItem(ORCH_LOG_KEY, JSON.stringify(orchestratorLog));
  }, [orchestratorLog]);

  useEffect(() => {
    localStorage.setItem(SESSION_STATE_KEY, JSON.stringify(sessionState));
  }, [sessionState]);

  useEffect(() => {
    if (lastReflection) {
      localStorage.setItem(REFLECTION_LOG_KEY, JSON.stringify(lastReflection));
    }
  }, [lastReflection]);

  // Creature field setters
  const setPersonality = useCallback((v: string) => setCreature(c => ({ ...c, personality: v })), []);
  const setBackstory = useCallback((v: string) => setCreature(c => ({ ...c, backstory: v })), []);
  const setThreads = useCallback((v: LifeThread[]) => setCreature(c => ({ ...c, threads: v })), []);
  const setDailyLifePrompt = useCallback((v: string) => setCreature(c => ({ ...c, dailyLifePrompt: v })), []);
  const setRelationshipLedger = useCallback((v: string) => setCreature(c => ({ ...c, relationshipLedger: v })), []);
  const setChildProfile = useCallback((v: string) => setCreature(c => ({ ...c, childProfile: v })), []);
  const setLastSessionSummary = useCallback((v: string) => setCreature(c => ({ ...c, lastSessionSummary: v })), []);

  // Thread helpers
  const addThread = useCallback(() => {
    const newThread: LifeThread = {
      id: `thread_${Date.now()}`,
      title: "New thread",
      current_state: "",
      developments: [],
      child_involved: false,
      child_advice: null,
      resolved: false,
    };
    setCreature(c => ({ ...c, threads: [...c.threads, newThread] }));
  }, []);

  // Advance a single thread (called when reflection says to advance)
  const advanceThread = useCallback((threadId: string) => {
    setCreature(c => {
      const updatedThreads = c.threads.map(t => {
        if (t.id !== threadId || t.developments.length === 0) return t;
        const [next, ...rest] = t.developments;
        return { ...t, current_state: next, developments: rest };
      });
      return { ...c, threads: updatedThreads };
    });
  }, []);

  // Advance all threads at once (manual testing)
  const advanceAllNow = useCallback(() => {
    setCreature(c => {
      const updatedThreads: LifeThread[] = [];
      const newCompleted = [...c.completedThreads];

      for (const thread of c.threads) {
        if (thread.developments.length > 0) {
          const [next, ...rest] = thread.developments;
          updatedThreads.push({ ...thread, current_state: next, developments: rest });
        } else if (!thread.current_state || thread.resolved) {
          newCompleted.push(`${thread.title} (resolved)`);
        } else {
          updatedThreads.push(thread);
        }
      }

      return { ...c, threads: updatedThreads, completedThreads: newCompleted };
    });
  }, []);

  // Resolve a thread
  const resolveThread = useCallback((threadId: string) => {
    setCreature(c => {
      const thread = c.threads.find(t => t.id === threadId);
      if (!thread) return c;
      return {
        ...c,
        threads: c.threads.map(t => t.id === threadId ? { ...t, resolved: true } : t),
        completedThreads: [...c.completedThreads, `${thread.title} (resolved)`],
      };
    });
  }, []);

  // Session state helpers
  const updateLastSessionTimestamp = useCallback(() => {
    setSessionState(s => ({ ...s, lastSessionTimestamp: new Date().toISOString() }));
  }, []);

  const incrementSessionCount = useCallback(() => {
    setSessionState(s => ({ ...s, sessionCount: s.sessionCount + 1 }));
  }, []);

  const isNewSession = useCallback((): boolean => {
    if (!sessionState.lastSessionTimestamp) return true;
    const lastTime = new Date(sessionState.lastSessionTimestamp).getTime();
    const now = Date.now();
    const minutesSince = (now - lastTime) / (1000 * 60);
    return minutesSince >= orchestrator.sessionTimeoutMinutes;
  }, [sessionState.lastSessionTimestamp, orchestrator.sessionTimeoutMinutes]);

  const getTimeSinceLastSession = useCallback((): string => {
    if (!sessionState.lastSessionTimestamp) return "never";
    const lastTime = new Date(sessionState.lastSessionTimestamp).getTime();
    const now = Date.now();
    const minutes = Math.floor((now - lastTime) / (1000 * 60));
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""}`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""}`;
  }, [sessionState.lastSessionTimestamp]);

  // Orchestrator setters
  const updateOrchestrator = useCallback((partial: Partial<OrchestratorConfig>) => {
    setOrchestrator(o => ({ ...o, ...partial }));
  }, []);

  const toggleSection = useCallback((section: string) => {
    setOrchestrator(o => {
      const sections = o.enabledSections.includes(section)
        ? o.enabledSections.filter(s => s !== section)
        : [...o.enabledSections, section];
      return { ...o, enabledSections: sections };
    });
  }, []);

  // Log orchestrator decision
  const logOrchestratorMeta = useCallback((meta: OrchestratorMeta) => {
    setOrchestratorLog(prev => [meta, ...prev].slice(0, 10));
  }, []);

  // Build the payload the frontend sends to the edge function
  const buildOrchestratorPayload = useCallback(() => {
    return {
      safetyGateEnabled: orchestrator.safetyGateEnabled,
      intentClassificationEnabled: orchestrator.intentClassificationEnabled,
      safetyDeflections: orchestrator.safetyDeflections,
      maxContextTokens: orchestrator.maxContextTokens,
      enabledSections: orchestrator.enabledSections,
      responseLengthLimit: orchestrator.responseLengthLimit,
      creaturePersonality: creature.personality,
      backstory: creature.backstory,
      activeThreads: JSON.stringify(creature.threads),
      relationshipLedger: creature.relationshipLedger,
      dailyLifePrompt: creature.dailyLifePrompt,
      childProfile: creature.childProfile,
    };
  }, [orchestrator, creature]);

  // Build reflection payload
  const buildReflectionPayload = useCallback(() => {
    return {
      creaturePersonality: creature.personality,
      relationshipLedger: creature.relationshipLedger,
      childProfile: creature.childProfile,
      lastSessionSummary: creature.lastSessionSummary,
      lastSessionTimestamp: sessionState.lastSessionTimestamp,
      currentTimestamp: new Date().toISOString(),
      lifeThreads: creature.threads.filter(t => !t.resolved),
      backstoryExcerpt: creature.backstory,
      seasonContext: getSeasonalContext(),
      isFirstEver: sessionState.sessionCount === 0,
    };
  }, [creature, sessionState]);

  // Reset
  const resetCreatureToDefaults = useCallback(() => {
    setCreature({
      personality: DEFAULT_PERSONALITY,
      backstory: DEFAULT_BACKSTORY,
      threads: DEFAULT_THREADS,
      dailyLifePrompt: DEFAULT_DAILY_LIFE,
      relationshipLedger: "",
      completedThreads: [],
      childProfile: "",
      lastSessionSummary: "",
    });
  }, []);

  const resetOrchestratorToDefaults = useCallback(() => {
    setOrchestrator({
      safetyGateEnabled: true,
      intentClassificationEnabled: true,
      safetyDeflections: DEFAULT_DEFLECTIONS,
      maxContextTokens: 2000,
      enabledSections: [...ALL_SECTIONS],
      responseLengthLimit: 200,
      sessionTimeoutMinutes: 30,
      profileUpdateFrequency: "every",
    });
    setOrchestratorLog([]);
  }, []);

  const hardResetCreature = useCallback(() => {
    resetCreatureToDefaults();
    resetOrchestratorToDefaults();
    setSessionState({ lastSessionTimestamp: null, lastSessionSummary: "", childProfile: "", sessionCount: 0 });
    setLastReflection(null);
    localStorage.removeItem(SESSION_STATE_KEY);
    localStorage.removeItem(REFLECTION_LOG_KEY);
  }, [resetCreatureToDefaults, resetOrchestratorToDefaults]);

  return {
    creature,
    setPersonality,
    setBackstory,
    setThreads,
    setDailyLifePrompt,
    setRelationshipLedger,
    setChildProfile,
    setLastSessionSummary,
    addThread,
    advanceThread,
    advanceAllNow,
    resolveThread,
    resetCreatureToDefaults,

    sessionState,
    updateLastSessionTimestamp,
    incrementSessionCount,
    isNewSession,
    getTimeSinceLastSession,

    lastReflection,
    setLastReflection,

    orchestrator,
    updateOrchestrator,
    toggleSection,
    orchestratorLog,
    logOrchestratorMeta,
    resetOrchestratorToDefaults,
    buildOrchestratorPayload,
    buildReflectionPayload,

    hardResetCreature,

    DEFAULT_PERSONALITY,
    DEFAULT_BACKSTORY,
    DEFAULT_DAILY_LIFE,
    DEFAULT_DEFLECTIONS,
    ALL_SECTIONS: ALL_SECTIONS as readonly string[],
  };
}
