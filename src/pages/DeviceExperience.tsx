import React, { useState, useCallback, useRef } from "react";
import DeviceFrame from "@/components/craiture/DeviceFrame";
import OnboardingScreen from "@/components/craiture/screens/OnboardingScreen";
import ChatScreen from "@/components/craiture/screens/ChatScreen";
import type { ChatMessage } from "@/components/craiture/screens/ChatScreen";
import TwoPlayerScreen from "@/components/craiture/screens/TwoPlayerScreen";
import type { TwoPlayerHandle } from "@/components/craiture/screens/TwoPlayerScreen";
import FourPlayerScreen from "@/components/craiture/screens/FourPlayerScreen";
import type { FourPlayerHandle } from "@/components/craiture/screens/FourPlayerScreen";
import { motion, AnimatePresence } from "framer-motion";

type Screen = "onboarding" | "chat";
type Overlay = null | "two-player" | "four-player";

const fontStyle = { fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" };

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

  const handleOnboardingComplete = useCallback((name: string) => {
    setUserName(name);
    setChatMessages([]);
    setScreen("chat");
    setChatMounted(true);
  }, []);

  const handleRestart = () => {
    setOverlay(null);
    setSleeping(false);
    setScreen("onboarding");
    setChatMounted(false);
    setChatMessages([]);
    setKey((k) => k + 1);
  };

  const handleSleepWake = () => {
    setSleeping((s) => !s);
  };

  const handleHiFive = (type: "two-player" | "four-player") => {
    if (overlay === type) {
      // Exit: will be handled by the screen's onExit
      return;
    }
    if (screen === "onboarding") return; // Can't hi-five during onboarding
    setOverlay(type);
  };

  const handleOverlayExit = useCallback(() => {
    setOverlay(null);
    // Append post-playdate Frog message
    const msg = postPlaydateMessages[Math.floor(Math.random() * postPlaydateMessages.length)];
    setChatMessages((prev) => [...prev, {
      sender: "Frog",
      message: msg,
      isUser: false,
      streaming: true,
    }]);
  }, []);

  const twoPlayerRef = useRef<TwoPlayerHandle>(null);
  const fourPlayerRef = useRef<FourPlayerHandle>(null);

  const twoPlayerActive = overlay === "two-player";
  const fourPlayerActive = overlay === "four-player";

  return (
    <div className="flex items-center justify-center min-h-screen gap-12 overflow-hidden" style={{ background: "hsl(220, 15%, 6%)" }}>
      {/* Device */}
      <div className="flex-shrink-0">
        <DeviceFrame>
          {/* Persistent chat layer - always mounted once onboarding is done */}
          {chatMounted && (
            <div className="absolute inset-0" style={{ visibility: overlay ? "hidden" : "visible" }}>
              <ChatScreen
                userName={userName}
                messages={chatMessages}
                onMessagesChange={setChatMessages}
                resumeMode={chatMessages.length > 0}
              />
            </div>
          )}

          {/* Onboarding - only shown before first chat */}
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
        <p
          className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-1 font-semibold"
          style={fontStyle}
        >
          Simulate
        </p>

        <button
          onClick={handleRestart}
          className="text-left px-4 py-3 rounded-xl text-[14px] font-medium text-muted-foreground/70 hover:text-foreground/80 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 active:scale-[0.97]"
          style={{ background: "hsla(230, 14%, 15%, 0.6)", ...fontStyle }}
        >
          🔄 Restart Onboarding
        </button>

        <button
          onClick={handleSleepWake}
          className="text-left px-4 py-3 rounded-xl text-[14px] font-medium text-muted-foreground/70 hover:text-foreground/80 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 active:scale-[0.97]"
          style={{ background: "hsla(230, 14%, 15%, 0.6)", ...fontStyle }}
        >
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
    </div>
  );
};

export default DeviceExperience;
