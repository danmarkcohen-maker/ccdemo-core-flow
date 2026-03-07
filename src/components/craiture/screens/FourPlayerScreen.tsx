import React, { useState, useEffect, useRef } from "react";
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

type Phase = "scanning" | "detected-1" | "detected-2" | "detected-3" | "pairing" | "connected" | "chat" | "departing" | "ended";

const chatMessages: Message[] = [
  { sender: "Beth", message: "Whoa, four of us! This is awesome!", isUser: true, creatureType: "frog" },
  { sender: "Frog", message: "A proper party! Ribbit! 🎉🐸", isUser: false, creatureType: "frog", streaming: true },
  { sender: "Sam", message: "Robot, what should we talk about?", isUser: true, creatureType: "robot" },
  { sender: "Robot", message: "I suggest: the deepest part of the ocean. Only 3 humans have ever been there.", isUser: false, creatureType: "robot", streaming: true },
  { sender: "Chloe", message: "Ooh spooky! What lives down there?", isUser: true, creatureType: "owl" },
  { sender: "Owl", message: "Creatures that make their own light — bioluminescence. Remarkable adaptation.", isUser: false, creatureType: "owl", streaming: true },
  { sender: "Fox", message: "I bet there are fish down there that have never seen sunlight! How wild is that? 🦊✨", isUser: false, creatureType: "fox", streaming: true },
];

const arrivals = [
  { emoji: "🦉", name: "Chloe's Owl" },
  { emoji: "🤖", name: "Sam's Robot" },
  { emoji: "🦊", name: "Mia's Fox" },
];

const fontStyle = { fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" };

const PulseRing: React.FC<{ color: string; delay?: number }> = ({ color, delay = 0 }) => (
  <motion.div
    className="absolute rounded-full border-2"
    style={{ borderColor: color }}
    initial={{ width: 40, height: 40, opacity: 0.8 }}
    animate={{ width: 160, height: 160, opacity: 0 }}
    transition={{ duration: 2, repeat: Infinity, delay, ease: "easeOut" }}
  />
);

const FourPlayerScreen: React.FC = () => {
  const [phase, setPhase] = useState<Phase>("scanning");
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [showThinking, setShowThinking] = useState(false);
  const [speakingCreature, setSpeakingCreature] = useState<CreatureType | null>(null);
  const [scriptIndex, setScriptIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Phase progression
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase("detected-1"), 2200));
    timers.push(setTimeout(() => setPhase("detected-2"), 4200));
    timers.push(setTimeout(() => setPhase("detected-3"), 6200));
    timers.push(setTimeout(() => setPhase("pairing"), 8200));
    timers.push(setTimeout(() => setPhase("connected"), 10200));
    timers.push(setTimeout(() => setPhase("chat"), 12000));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Chat playback
  useEffect(() => {
    if (phase !== "chat" || scriptIndex >= chatMessages.length) {
      if (phase === "chat" && scriptIndex >= chatMessages.length) {
        const t = setTimeout(() => setPhase("departing"), 3000);
        return () => clearTimeout(t);
      }
      return;
    }
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

  // Departing → ended
  useEffect(() => {
    if (phase !== "departing") return;
    const t = setTimeout(() => setPhase("ended"), 4000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleMessages, showThinking]);

  const isPreChat = ["scanning", "detected-1", "detected-2", "detected-3", "pairing", "connected"].includes(phase);
  const detectedCount = phase === "detected-1" ? 1 : phase === "detected-2" ? 2 : phase === "detected-3" ? 3 : 0;

  return (
    <>
      <FrogCreature opacity={phase === "chat" ? 0.14 : 0} size={160} speaking={speakingCreature === "frog"} className="top-[2%] left-[2%] transition-opacity duration-[1500ms]" />
      <OwlCreature opacity={phase === "chat" ? 0.14 : 0} size={160} speaking={speakingCreature === "owl"} className="top-[2%] right-[2%] transition-opacity duration-[1500ms]" />
      <RobotCreature opacity={phase === "chat" ? 0.14 : 0} size={160} speaking={speakingCreature === "robot"} className="bottom-[12%] left-[2%] transition-opacity duration-[1500ms]" />
      <FoxCreature opacity={phase === "chat" ? 0.14 : 0} size={160} speaking={speakingCreature === "fox"} className="bottom-[12%] right-[2%] transition-opacity duration-[1500ms]" />

      <div className="relative z-10 flex flex-col h-full">
        <AnimatePresence mode="wait">
          {/* Discovery phases */}
          {phase === "scanning" && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="flex-1 flex flex-col items-center justify-center px-6">
              <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
                <PulseRing color="hsla(120, 40%, 50%, 0.4)" delay={0} />
                <PulseRing color="hsla(120, 40%, 50%, 0.3)" delay={0.7} />
                <PulseRing color="hsla(120, 40%, 50%, 0.2)" delay={1.4} />
                <motion.div className="w-10 h-10 rounded-full" style={{ background: "hsla(120, 40%, 50%, 0.6)", boxShadow: "0 0 30px hsla(120, 40%, 50%, 0.3)" }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              </div>
              <p className="text-[16px] text-muted-foreground/60 mt-6" style={fontStyle}>Looking for nearby Craitures…</p>
            </motion.div>
          )}

          {/* Sequential detection of 3 creatures */}
          {(phase === "detected-1" || phase === "detected-2" || phase === "detected-3") && (
            <motion.div key="detecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
              <div className="flex gap-4">
                {arrivals.slice(0, detectedCount).map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 14 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-[28px]"
                    style={{ background: "hsla(120, 40%, 50%, 0.12)", border: "2px solid hsla(120, 40%, 50%, 0.25)" }}
                  >
                    {a.emoji}
                  </motion.div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-[17px] font-semibold text-foreground/90" style={fontStyle}>
                  {detectedCount} Craiture{detectedCount > 1 ? "s" : ""} detected!
                </p>
                <p className="text-[13px] text-muted-foreground/50 mt-1" style={fontStyle}>
                  {arrivals.slice(0, detectedCount).map((a) => a.name).join(", ")}
                </p>
              </div>
              {detectedCount < 3 && (
                <motion.p className="text-[12px] text-muted-foreground/30" style={fontStyle} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  Still scanning…
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Pairing */}
          {phase === "pairing" && (
            <motion.div key="pairing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
              <div className="flex items-center gap-3">
                {["🐸", "🦉", "🤖", "🦊"].map((e, i) => (
                  <motion.span key={i} className="text-[32px]" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}>
                    {e}
                  </motion.span>
                ))}
              </div>
              <p className="text-[16px] text-muted-foreground/60" style={fontStyle}>Syncing all Craitures…</p>
            </motion.div>
          )}

          {/* Connected */}
          {phase === "connected" && (
            <motion.div key="connected" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
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
                <p className="text-[18px] font-semibold text-foreground/90" style={fontStyle}>Playdate started!</p>
                <p className="text-[12px] text-muted-foreground/40 mt-2 leading-relaxed" style={fontStyle}>
                  Beth 🐸 · Chloe 🦉 · Sam 🤖 · Mia 🦊
                </p>
              </div>
            </motion.div>
          )}

          {/* Chat */}
          {phase === "chat" && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="flex-1 flex flex-col h-full">
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollBehavior: "smooth" }}>
                {visibleMessages.map((msg, i) => (
                  <ChatBubble key={i} sender={msg.sender} message={msg.message} isUser={msg.isUser} creatureType={msg.creatureType} streaming={msg.streaming} />
                ))}
                {showThinking && <ThinkingDots />}
              </div>
              <ChatInput placeholder="Type a message..." />
            </motion.div>
          )}

          {/* Departing */}
          {phase === "departing" && (
            <motion.div key="departing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
              <div className="flex items-center gap-6">
                {["🐸", "🦉", "🤖", "🦊"].map((e, i) => (
                  <motion.span
                    key={i}
                    className="text-[32px]"
                    animate={{
                      x: (i < 2 ? -1 : 1) * 50,
                      y: (i % 2 === 0 ? -1 : 1) * 30,
                      opacity: 0,
                    }}
                    transition={{ duration: 3, ease: "easeIn", delay: i * 0.2 }}
                  >
                    {e}
                  </motion.span>
                ))}
              </div>
              <p className="text-[16px] text-muted-foreground/60" style={fontStyle}>Friends moving away…</p>
              <motion.p
                className="text-[13px] text-muted-foreground/30"
                style={fontStyle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                Playdate chat deleted
              </motion.p>
            </motion.div>
          )}

          {/* Ended */}
          {phase === "ended" && (
            <motion.div key="ended" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
              <FrogCreature opacity={0.25} size={300} speaking={false} className="top-[10%] left-1/2 -translate-x-1/2" />
              <p className="text-[16px] text-muted-foreground/60 relative z-10" style={fontStyle}>Just you and Frog again 🐸</p>
              <p className="text-[12px] text-muted-foreground/30 relative z-10" style={fontStyle}>All playdate messages were erased</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default FourPlayerScreen;
