import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import OwlCreature from "@/components/craiture/creatures/OwlCreature";
import RobotCreature from "@/components/craiture/creatures/RobotCreature";
import FoxCreature from "@/components/craiture/creatures/FoxCreature";
import ChatBubble from "@/components/craiture/ChatBubble";
import ThinkingDots from "@/components/craiture/ThinkingDots";
import ChatInput from "@/components/craiture/ChatInput";
import { motion, AnimatePresence } from "framer-motion";
import type { CreatureType } from "@/components/craiture/ChatBubble";

interface Message {
  sender: string;
  message: string;
  isUser: boolean;
  creatureType: CreatureType;
  streaming?: boolean;
}

type Phase = "hi-five" | "confirm" | "connecting" | "connected" | "chat" | "departing";

interface FourPlayerScreenProps {
  onExit: () => void;
  onSpeakingChange?: (speaking: boolean) => void;
}

const chatMessages: Message[] = [
  { sender: "Beth", message: "Whoa, four of us! This is awesome!", isUser: true, creatureType: "frog" },
  { sender: "Frog", message: "A proper party! Ribbit! 🎉🐸", isUser: false, creatureType: "frog", streaming: true },
  { sender: "Juliet", message: "Robot, what should we talk about?", isUser: true, creatureType: "robot" },
  { sender: "Robot", message: "I suggest: the deepest part of the ocean. Only 3 humans have ever been there.", isUser: false, creatureType: "robot", streaming: true },
  { sender: "Chloe", message: "Ooh spooky! What lives down there?", isUser: true, creatureType: "owl" },
  { sender: "Owl", message: "Creatures that make their own light — bioluminescence. Remarkable adaptation.", isUser: false, creatureType: "owl", streaming: true },
  { sender: "Fox", message: "I bet there are fish down there that have never seen sunlight! How wild is that? 🦊✨", isUser: false, creatureType: "fox", streaming: true },
];

const fontStyle = { fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" };

export interface FourPlayerHandle {
  triggerDepart: () => void;
}

const FourPlayerScreen = forwardRef<FourPlayerHandle, FourPlayerScreenProps>(({ onExit, onSpeakingChange }, ref) => {
  const [phase, setPhase] = useState<Phase>("hi-five");
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [showThinking, setShowThinking] = useState(false);
  const [speakingCreatureRaw, setSpeakingCreatureRaw] = useState<CreatureType | null>(null);

  const setSpeakingCreature = (val: CreatureType | null) => {
    setSpeakingCreatureRaw(val);
    onSpeakingChange?.(val === "frog");
  };

  const speakingCreature = speakingCreatureRaw;
  const [scriptIndex, setScriptIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    triggerDepart: () => setPhase("departing"),
  }));

  // Hi-Five flash → confirm
  useEffect(() => {
    const t = setTimeout(() => setPhase("confirm"), 1000);
    return () => clearTimeout(t);
  }, []);

  const handleConfirm = () => {
    setPhase("connecting");
    setTimeout(() => setPhase("connected"), 1500);
    setTimeout(() => setPhase("chat"), 3200);
  };

  // Chat playback
  useEffect(() => {
    if (phase !== "chat" || scriptIndex >= chatMessages.length) return;
    const msg = chatMessages[scriptIndex];
    const delay = scriptIndex === 0 ? 600 : 2400;

    if (!msg.isUser) {
      const t1 = setTimeout(() => { setShowThinking(true); setSpeakingCreature(msg.creatureType); }, delay);
      const t2 = setTimeout(() => {
        setShowThinking(false);
        setVisibleMessages((prev) => [...prev, msg]);
        setTimeout(() => setSpeakingCreature(null), 2000);
        setScriptIndex((i) => i + 1);
      }, delay + 2200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      const t = setTimeout(() => { setVisibleMessages((prev) => [...prev, msg]); setScriptIndex((i) => i + 1); }, delay);
      return () => clearTimeout(t);
    }
  }, [phase, scriptIndex]);

  // Departing → exit
  useEffect(() => {
    if (phase !== "departing") return;
    const t = setTimeout(() => onExit(), 4500);
    return () => clearTimeout(t);
  }, [phase, onExit]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleMessages, showThinking]);

  const isPreChat = ["hi-five", "confirm", "connecting", "connected"].includes(phase);

  return (
    <>
      <FrogCreature opacity={phase === "chat" ? 0.14 : 0} size={160} speaking={speakingCreature === "frog"} className="top-[2%] left-[2%] transition-opacity duration-[1500ms]" />
      <OwlCreature opacity={phase === "chat" ? 0.14 : 0} size={160} speaking={speakingCreature === "owl"} className="top-[2%] right-[2%] transition-opacity duration-[1500ms]" />
      <RobotCreature opacity={phase === "chat" ? 0.14 : 0} size={160} speaking={speakingCreature === "robot"} className="bottom-[12%] left-[2%] transition-opacity duration-[1500ms]" />
      <FoxCreature opacity={phase === "chat" ? 0.14 : 0} size={160} speaking={speakingCreature === "fox"} className="bottom-[12%] right-[2%] transition-opacity duration-[1500ms]" />

      <div className="relative z-10 flex flex-col h-full">
        <AnimatePresence mode="wait">
          {isPreChat && (
            <motion.div
              key="pre-chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center px-6"
            >
              {/* Hi-Five flash */}
              {phase === "hi-five" && (
                <motion.div
                  className="flex flex-col items-center gap-4"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <motion.div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{ background: "hsla(45, 80%, 55%, 0.2)", border: "3px solid hsla(45, 80%, 55%, 0.5)" }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.4, repeat: 2 }}
                  >
                    <span className="text-[48px]">🙌</span>
                  </motion.div>
                  <p className="text-[22px] font-bold text-foreground/90" style={fontStyle}>
                    Hi-Five!
                  </p>
                </motion.div>
              )}

              {/* Confirmation - awaits user tap */}
              {phase === "confirm" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[30px]">🐸</span>
                    <span className="text-[16px] text-muted-foreground/30">×</span>
                    <span className="text-[30px]">🦉</span>
                    <span className="text-[16px] text-muted-foreground/30">×</span>
                    <span className="text-[30px]">🤖</span>
                    <span className="text-[16px] text-muted-foreground/30">×</span>
                    <span className="text-[30px]">🦊</span>
                  </div>
                  <p className="text-[16px] font-semibold text-foreground/85 text-center leading-relaxed" style={fontStyle}>
                    Hi-Five with Chloe's Owl,<br />Juliet's Robot & Cara's Fox?
                  </p>
                  <motion.button
                    onClick={handleConfirm}
                    className="px-8 py-3 rounded-full text-[16px] font-semibold text-foreground/90 cursor-pointer active:scale-95 transition-transform"
                    style={{
                      background: "hsla(120, 40%, 40%, 0.3)",
                      border: "2px solid hsla(120, 40%, 50%, 0.4)",
                      ...fontStyle,
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Yes! ✨
                  </motion.button>
                </motion.div>
              )}

              {/* Connecting - network spin-up */}
              {phase === "connecting" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-5"
                >
                  <motion.div
                    className="w-16 h-16 rounded-full border-2 border-t-transparent"
                    style={{ borderColor: "hsla(120, 40%, 50%, 0.4)", borderTopColor: "transparent" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-[14px] text-muted-foreground/50" style={fontStyle}>
                    Connecting 4 Craitures…
                  </p>
                </motion.div>
              )}

              {/* Connected */}
              {phase === "connected" && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-5"
                >
                  <motion.div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "hsla(120, 50%, 40%, 0.2)", border: "2px solid hsla(120, 40%, 50%, 0.4)" }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  >
                    <span className="text-[32px]">✨</span>
                  </motion.div>
                  <div className="text-center">
                    <p className="text-[18px] font-semibold text-foreground/90" style={fontStyle}>Hi-Five! Playdate started!</p>
                    <p className="text-[12px] text-muted-foreground/40 mt-2 leading-relaxed" style={fontStyle}>
                      Beth 🐸 · Chloe 🦉 · Juliet 🤖 · Cara 🦊
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Chat */}
          {phase === "chat" && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="flex-1 flex flex-col h-full min-h-0">
              <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4" style={{ scrollBehavior: "smooth" }}>
                {visibleMessages.map((msg, i) => (
                  <ChatBubble key={i} sender={msg.sender} message={msg.message} isUser={msg.isUser} creatureType={msg.creatureType} streaming={msg.streaming} />
                ))}
                {showThinking && <ThinkingDots />}
              </div>
              <ChatInput placeholder="Type a message..." />
            </motion.div>
          )}

          {/* Departing - creatures say goodbye */}
          {phase === "departing" && (
            <motion.div
              key="departing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 gap-4"
            >
              {/* Creatures waving goodbye */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { emoji: "🐸", name: "Frog", delay: 0.2 },
                  { emoji: "🦉", name: "Owl", delay: 0.4 },
                  { emoji: "🤖", name: "Robot", delay: 0.6 },
                  { emoji: "🦊", name: "Fox", delay: 0.8 },
                ].map((c, i) => (
                  <motion.div
                    key={i}
                    className="flex flex-col items-center gap-1"
                    animate={{ opacity: 0, y: -20 }}
                    transition={{ duration: 2, ease: "easeIn", delay: 1.8 + c.delay }}
                  >
                    <motion.span
                      className="text-[36px]"
                      animate={{ rotate: [0, 15, -15, 15, -15, 0] }}
                      transition={{ duration: 0.8, repeat: 2, delay: c.delay }}
                    >
                      {c.emoji}
                    </motion.span>
                    <span className="text-[10px] text-muted-foreground/40" style={fontStyle}>{c.name}</span>
                  </motion.div>
                ))}
              </div>

              {/* Goodbye messages */}
              <motion.div
                className="flex flex-col items-center gap-2 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.p className="text-[14px] text-foreground/70 italic" style={fontStyle}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  "What a party! Ribbit!" 🐸🎉
                </motion.p>
                <motion.p className="text-[14px] text-foreground/70 italic" style={fontStyle}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                  "Farewell, friends." 🦉
                </motion.p>
                <motion.p className="text-[14px] text-foreground/70 italic" style={fontStyle}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                  "See ya! Stay wild!" 🦊✨
                </motion.p>
              </motion.div>

              {/* Playdate ended notice */}
              <motion.div
                className="flex flex-col items-center gap-1 mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2 }}
              >
                <p className="text-[14px] text-muted-foreground/50" style={fontStyle}>
                  Playdate ended
                </p>
                <p className="text-[11px] text-muted-foreground/25" style={fontStyle}>
                  Chat messages aren't stored anywhere 🔒
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
});

FourPlayerScreen.displayName = "FourPlayerScreen";

export default FourPlayerScreen;
