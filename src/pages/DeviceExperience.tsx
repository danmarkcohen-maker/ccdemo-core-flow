import React, { useState, useCallback, useRef } from "react";
import DeviceFrame from "@/components/craiture/DeviceFrame";
import OnboardingScreen from "@/components/craiture/screens/OnboardingScreen";
import ChatScreen from "@/components/craiture/screens/ChatScreen";
import type { ChatMessage } from "@/components/craiture/screens/ChatScreen";
import TwoPlayerScreen from "@/components/craiture/screens/TwoPlayerScreen";
import type { TwoPlayerHandle } from "@/components/craiture/screens/TwoPlayerScreen";
import FourPlayerScreen from "@/components/craiture/screens/FourPlayerScreen";
import type { FourPlayerHandle } from "@/components/craiture/screens/FourPlayerScreen";
import ConfigPanel from "@/components/craiture/ConfigPanel";
import { useConfigPanel } from "@/hooks/useConfigPanel";
import { useCreatureConfig } from "@/hooks/useCreatureConfig";
import type { OrchestratorMeta, LifeThread, ReflectionOutput } from "@/hooks/useCreatureConfig";
import { motion, AnimatePresence } from "framer-motion";

type Screen = "onboarding" | "chat";
type Overlay = null | "two-player" | "four-player";

const fontStyle = { fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" };

const PROFILE_UPDATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-profile`;

const postPlaydateMessages = [
  "That was fun! Now, where were we? 🐸",
  "Ribbit! Good times. Back to just us! 🐸💚",
  "What a playdate! So, what's next? 🐸✨",
];

const resumeHistory: ChatMessage[] = [
  { sender: "Beth", message: "Do you think clouds have feelings?", isUser: true },
  { sender: "Frog", message: "Ribbit! I think they feel light and fluffy… until they get angry and rain on everyone 🌧️🐸", isUser: false },
  { sender: "Beth", message: "Haha that's kind of beautiful actually", isUser: true },
  { sender: "Frog", message: "You're kind of beautiful actually ✨🐸", isUser: false },
  { sender: "Beth", message: "Aww stop it 😊", isUser: true },
  { sender: "Frog", message: "Never! Compliments are free and I have unlimited supply 🐸💚", isUser: false },
];

const DeviceExperience: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [sleeping, setSleeping] = useState(false);
  const [userName, setUserName] = useState("Beth");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(resumeHistory);
  const [key, setKey] = useState(0);
  const [chatMounted, setChatMounted] = useState(false);
  const config = useConfigPanel();
  const creatureConfig = useCreatureConfig();
  const responseCountRef = useRef(0);

  const handleOnboardingComplete = useCallback((name: string, age: number, topics?: string[]) => {
    setUserName(name);
    config.initializeForAge(age);
    if (topics && topics.length > 0) {
      config.seedTopics(topics);
    }
    setChatMessages([]);
    setScreen("chat");
    setChatMounted(true);
    creatureConfig.incrementSessionCount();
  }, [config, creatureConfig]);

  const handleRestart = () => {
    setOverlay(null);
    setSleeping(false);
    setScreen("onboarding");
    setChatMounted(false);
    setChatMessages([]);
    setKey((k) => k + 1);
  };

  const handleHardReset = () => {
    config.hardReset();
    config.resetAllTimeStats();
    creatureConfig.hardResetCreature();
    setUserName("Beth");
    setOverlay(null);
    setSleeping(false);
    setScreen("onboarding");
    setChatMounted(false);
    setChatMessages([]);
    responseCountRef.current = 0;
    setKey((k) => k + 1);
  };

  const handleSleepWake = () => {
    setSleeping((s) => !s);
  };

  const handleHiFive = (type: "two-player" | "four-player") => {
    if (overlay === type) return;
    if (screen === "onboarding") return;
    setOverlay(type);
  };

  const handleOverlayExit = useCallback(() => {
    setOverlay(null);
    const msg = postPlaydateMessages[Math.floor(Math.random() * postPlaydateMessages.length)];
    setChatMessages((prev) => [...prev, {
      sender: "Frog",
      message: msg,
      isUser: false,
      streaming: true,
    }]);
  }, []);

  const handleOrchestratorMeta = useCallback((meta: OrchestratorMeta) => {
    creatureConfig.logOrchestratorMeta(meta);
  }, [creatureConfig]);

  // Handle reflection completion — apply thread updates
  const handleReflectionComplete = useCallback((reflection: ReflectionOutput | null, updatedThreads: LifeThread[] | null) => {
    if (reflection) {
      creatureConfig.setLastReflection(reflection);
    }
    if (updatedThreads) {
      creatureConfig.setThreads(updatedThreads);
    }
  }, [creatureConfig]);

  // Handle message sent — update session timestamp
  const handleMessageSent = useCallback(() => {
    creatureConfig.updateLastSessionTimestamp();
  }, [creatureConfig]);

  // Handle profile update after response
  const handleResponseComplete = useCallback(async (msgs: { role: "user" | "assistant"; content: string }[]) => {
    responseCountRef.current += 1;

    const freq = creatureConfig.orchestrator.profileUpdateFrequency;
    const shouldUpdate =
      freq === "every" ||
      (freq === "every3" && responseCountRef.current % 3 === 0);

    if (!shouldUpdate) return;

    try {
      const resp = await fetch(PROFILE_UPDATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          currentProfile: creatureConfig.creature.childProfile,
          currentLedger: creatureConfig.creature.relationshipLedger,
          conversation: msgs,
          knownName: userName,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const ensureStr = (v: unknown): string =>
          typeof v === "string" ? v : typeof v === "object" && v !== null ? JSON.stringify(v, null, 2) : String(v ?? "");
        if (data.updatedProfile) creatureConfig.setChildProfile(ensureStr(data.updatedProfile));
        if (data.updatedLedger) creatureConfig.setRelationshipLedger(ensureStr(data.updatedLedger));
        if (data.sessionSummary) creatureConfig.setLastSessionSummary(ensureStr(data.sessionSummary));

        // Track usage
        if (data.usage) {
          config.recordUsage(0, 0, {
            prompt_tokens: data.usage.prompt_tokens || 0,
            completion_tokens: data.usage.completion_tokens || 0,
            total_tokens: data.usage.total_tokens || 0,
          });
        }
      }
    } catch (e) {
      console.warn("Profile update error:", e);
    }
  }, [creatureConfig, userName, config]);

  const twoPlayerRef = useRef<TwoPlayerHandle>(null);
  const fourPlayerRef = useRef<FourPlayerHandle>(null);

  const twoPlayerActive = overlay === "two-player";
  const fourPlayerActive = overlay === "four-player";

  // Handle threads JSON change from config panel
  const handleThreadsChange = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        creatureConfig.setThreads(parsed);
      }
    } catch {
      // Invalid JSON — ignore until valid
    }
  }, [creatureConfig]);

  // Build reflection payload for ChatScreen
  const reflectionPayload = creatureConfig.buildReflectionPayload();
  const isNewSession = creatureConfig.isNewSession();
  const isFirstEver = creatureConfig.sessionState.sessionCount === 0;

  return (
    <div className="flex items-center justify-center min-h-screen gap-12 overflow-hidden" style={{ background: "hsl(220, 15%, 6%)" }}>
      {/* Device */}
      <div className="flex-shrink-0">
        <DeviceFrame>
          {/* Persistent chat layer */}
          {chatMounted && (
            <div className="absolute inset-0" style={{ visibility: overlay ? "hidden" : "visible" }}>
              <ChatScreen
                userName={userName}
                messages={chatMessages}
                onMessagesChange={setChatMessages}
                resumeMode={chatMessages.length > 0 && !isNewSession}
                systemPrompt={config.buildCombinedPrompt(userName)}
                orchestratorConfig={creatureConfig.buildOrchestratorPayload()}
                onUsage={config.recordUsage}
                onResponseComplete={handleResponseComplete}
                onOrchestratorMeta={handleOrchestratorMeta}
                reflectionPayload={isNewSession || isFirstEver ? reflectionPayload : null}
                isFirstEver={isFirstEver}
                onReflectionComplete={handleReflectionComplete}
                onMessageSent={handleMessageSent}
              />
            </div>
          )}

          {/* Onboarding */}
          <AnimatePresence mode="wait">
            {screen === "onboarding" && !chatMounted && (
              <motion.div
                key={`onboarding-${key}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <OnboardingScreen onComplete={handleOnboardingComplete} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overlay: multiplayer screens */}
          <AnimatePresence>
            {twoPlayerActive && (
              <motion.div
                key="two-player-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
                style={{ background: "hsl(230, 18%, 4%)" }}
              >
                <TwoPlayerScreen ref={twoPlayerRef} onExit={handleOverlayExit} />
              </motion.div>
            )}
            {fourPlayerActive && (
              <motion.div
                key="four-player-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
                style={{ background: "hsl(230, 18%, 4%)" }}
              >
                <FourPlayerScreen ref={fourPlayerRef} onExit={handleOverlayExit} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sleep overlay */}
          <AnimatePresence>
            {sleeping && (
              <motion.div
                key="sleep"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 z-50"
                style={{ background: "hsl(0, 0%, 0%)" }}
              />
            )}
          </AnimatePresence>
        </DeviceFrame>
      </div>

      {/* External Controls */}
      <div className="flex flex-col gap-3 w-[220px]">
        <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-1 font-semibold" style={fontStyle}>
          Simulate
        </p>

        <button onClick={handleRestart} className="text-left px-4 py-3 rounded-xl text-[14px] font-medium text-muted-foreground/70 hover:text-foreground/80 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 active:scale-[0.97]" style={{ background: "hsla(230, 14%, 15%, 0.6)", ...fontStyle }}>
          🔄 Restart Onboarding
        </button>

        <button onClick={handleHardReset} className="text-left px-4 py-3 rounded-xl text-[14px] font-medium text-muted-foreground/70 hover:text-red-400/80 border border-white/[0.06] hover:border-red-400/20 transition-all duration-200 active:scale-[0.97]" style={{ background: "hsla(230, 14%, 15%, 0.6)", ...fontStyle }}>
          🧹 Hard Reset
        </button>

        <button onClick={handleSleepWake} className="text-left px-4 py-3 rounded-xl text-[14px] font-medium text-muted-foreground/70 hover:text-foreground/80 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 active:scale-[0.97]" style={{ background: "hsla(230, 14%, 15%, 0.6)", ...fontStyle }}>
          {sleeping ? "☀️ Wake" : "💤 Sleep"}
        </button>

        <button
          onClick={() => overlay === "two-player" ? twoPlayerRef.current?.triggerDepart() : handleHiFive("two-player")}
          disabled={screen === "onboarding" || overlay === "four-player"}
          className="text-left px-4 py-3 rounded-xl text-[14px] font-medium text-muted-foreground/70 hover:text-foreground/80 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 active:scale-[0.97] disabled:opacity-30 disabled:pointer-events-none"
          style={{ background: "hsla(230, 14%, 15%, 0.6)", ...fontStyle }}
        >
          {twoPlayerActive ? "👋 Exit Chat" : "🙌 Hi-Five 1 Friend"}
        </button>

        <button
          onClick={() => overlay === "four-player" ? fourPlayerRef.current?.triggerDepart() : handleHiFive("four-player")}
          disabled={screen === "onboarding" || overlay === "two-player"}
          className="text-left px-4 py-3 rounded-xl text-[14px] font-medium text-muted-foreground/70 hover:text-foreground/80 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 active:scale-[0.97] disabled:opacity-30 disabled:pointer-events-none"
          style={{ background: "hsla(230, 14%, 15%, 0.6)", ...fontStyle }}
        >
          {fourPlayerActive ? "👋 Exit Chat" : "🙌 Hi-Five 3 Friends"}
        </button>
      </div>

      {/* Config Panel */}
      <ConfigPanel
        isOpen={config.isOpen}
        onClose={() => config.setIsOpen(false)}
        systemPrompt={config.systemPrompt}
        onSystemPromptChange={config.setSystemPrompt}
        rules={config.rules}
        onRulesChange={config.setRules}
        defaultPrompt={config.DEFAULT_SYSTEM_PROMPT}
        defaultRules={config.DEFAULT_RULES}
        chatMessages={chatMessages}
        sessionStats={config.sessionStats}
        allTimeStats={config.allTimeStats}
        onResetAllTime={config.resetAllTimeStats}
        userName={userName}
        memories={config.memories}
        isExtracting={config.isExtracting}
        onReExtract={() => {
          // Trigger profile update instead of old extraction
          const apiMsgs = chatMessages.map(m => ({
            role: m.isUser ? "user" as const : "assistant" as const,
            content: m.message,
          }));
          handleResponseComplete(apiMsgs);
        }}
        onClearMemories={config.clearMemories}
        // Creature props
        creature={creatureConfig.creature}
        onPersonalityChange={creatureConfig.setPersonality}
        onBackstoryChange={creatureConfig.setBackstory}
        onThreadsChange={handleThreadsChange}
        onDailyLifeChange={creatureConfig.setDailyLifePrompt}
        onLedgerChange={creatureConfig.setRelationshipLedger}
        onChildProfileChange={creatureConfig.setChildProfile}
        onAddThread={creatureConfig.addThread}
        onAdvanceAll={creatureConfig.advanceAllNow}
        onResetCreature={creatureConfig.resetCreatureToDefaults}
        defaultPersonality={creatureConfig.DEFAULT_PERSONALITY}
        defaultBackstory={creatureConfig.DEFAULT_BACKSTORY}
        defaultDailyLife={creatureConfig.DEFAULT_DAILY_LIFE}
        // Orchestrator props
        orchestrator={creatureConfig.orchestrator}
        onOrchestratorChange={creatureConfig.updateOrchestrator}
        onToggleSection={creatureConfig.toggleSection}
        onResetOrchestrator={creatureConfig.resetOrchestratorToDefaults}
        orchestratorLog={creatureConfig.orchestratorLog}
        allSections={creatureConfig.ALL_SECTIONS}
        defaultDeflections={creatureConfig.DEFAULT_DEFLECTIONS}
        // Reflection debug
        lastReflection={creatureConfig.lastReflection}
        lastSessionSummary={creatureConfig.creature.lastSessionSummary}
      />
    </div>
  );
};

export default DeviceExperience;
