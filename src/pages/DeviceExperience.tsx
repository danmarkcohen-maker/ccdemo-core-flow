import React, { useState, useCallback } from "react";
import DeviceFrame from "@/components/craiture/DeviceFrame";
import OnboardingScreen from "@/components/craiture/screens/OnboardingScreen";
import ChatScreen from "@/components/craiture/screens/ChatScreen";
import TwoPlayerScreen from "@/components/craiture/screens/TwoPlayerScreen";
import FourPlayerScreen from "@/components/craiture/screens/FourPlayerScreen";
import { motion, AnimatePresence } from "framer-motion";

type Screen = "onboarding" | "chat" | "resume" | "two-player" | "four-player";

const fontStyle = { fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" };

const DeviceExperience: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [userName, setUserName] = useState("Beth");
  const [key, setKey] = useState(0); // force remount on restart

  const handleOnboardingComplete = useCallback((name: string) => {
    setUserName(name);
    setScreen("chat");
  }, []);

  const handleRestart = () => {
    setScreen("onboarding");
    setKey((k) => k + 1);
  };

  const handleResume = () => {
    setScreen("resume");
    setKey((k) => k + 1);
  };

  const handleSimulateTwoPlayer = () => {
    setScreen("two-player");
    setKey((k) => k + 1);
  };

  const handleSimulateFourPlayer = () => {
    setScreen("four-player");
    setKey((k) => k + 1);
  };

  return (
    <div className="flex items-center justify-center min-h-screen gap-12" style={{ background: "hsl(220, 15%, 6%)" }}>
      {/* Device */}
      <div className="flex-shrink-0">
        <DeviceFrame>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${screen}-${key}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {screen === "onboarding" && (
                <OnboardingScreen onComplete={handleOnboardingComplete} />
              )}
              {screen === "chat" && (
                <ChatScreen userName={userName} />
              )}
              {screen === "resume" && (
                <ChatScreen userName={userName} resumeMode />
              )}
              {screen === "two-player" && <TwoPlayerScreen />}
              {screen === "four-player" && <FourPlayerScreen />}
            </motion.div>
          </AnimatePresence>
        </DeviceFrame>
      </div>

      {/* External Controls */}
      <div className="flex flex-col gap-3 w-[200px]">
        <p
          className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-1 font-semibold"
          style={fontStyle}
        >
          Simulate
        </p>

        <button
          onClick={handleRestart}
          className="text-left px-4 py-3 rounded-xl text-[14px] font-medium text-muted-foreground/70 hover:text-foreground/80 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 active:scale-[0.97]"
          style={{
            background: "hsla(230, 14%, 15%, 0.6)",
            ...fontStyle,
          }}
        >
          🔄 Restart Onboarding
        </button>

        <button
          onClick={handleResume}
          className="text-left px-4 py-3 rounded-xl text-[14px] font-medium text-muted-foreground/70 hover:text-foreground/80 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 active:scale-[0.97]"
          style={{
            background: "hsla(230, 14%, 15%, 0.6)",
            ...fontStyle,
          }}
        >
          💤 Resume (Wake)
        </button>

        <button
          onClick={handleSimulateTwoPlayer}
          className="text-left px-4 py-3 rounded-xl text-[14px] font-medium text-muted-foreground/70 hover:text-foreground/80 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 active:scale-[0.97]"
          style={{
            background: "hsla(230, 14%, 15%, 0.6)",
            ...fontStyle,
          }}
        >
          👥 2nd Human Joins
        </button>

        <button
          onClick={handleSimulateFourPlayer}
          className="text-left px-4 py-3 rounded-xl text-[14px] font-medium text-muted-foreground/70 hover:text-foreground/80 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 active:scale-[0.97]"
          style={{
            background: "hsla(230, 14%, 15%, 0.6)",
            ...fontStyle,
          }}
        >
          🎮 4-Player Playdate
        </button>

        {/* Current state indicator */}
        <div className="mt-4 px-4 py-2.5 rounded-xl border border-white/[0.04]" style={{ background: "hsla(230, 14%, 12%, 0.4)" }}>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/30 font-semibold" style={fontStyle}>
            Current
          </p>
          <p className="text-[13px] text-muted-foreground/60 mt-0.5" style={fontStyle}>
            {screen === "onboarding" && "First Activation"}
            {screen === "chat" && `Chat · ${userName} + Frog`}
            {screen === "resume" && `Resumed · ${userName} + Frog`}
            {screen === "two-player" && "2-Player Playdate"}
            {screen === "four-player" && "4-Player Playdate"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeviceExperience;
