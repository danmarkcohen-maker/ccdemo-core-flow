import React, { useState, useEffect, useRef } from "react";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import OwlCreature from "@/components/craiture/creatures/OwlCreature";
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

type Phase = "scanning" | "detected" | "pairing" | "connected" | "chat" | "departing" | "ended";

const chatMessages: Message[] = [
  { sender: "Beth", message: "Hey Chloe! Your owl is so cool!", isUser: true, creatureType: "frog" },
  { sender: "Frog", message: "Ribbit! A new friend! This is exciting! 🐸", isUser: false, creatureType: "frog", streaming: true },
  { sender: "Chloe", message: "Thanks! I love your frog too 🐸", isUser: true, creatureType: "owl" },
  { sender: "Owl", message: "A pleasure to meet you both. Shall we explore a topic together? 🦉", isUser: false, creatureType: "owl", streaming: true },
  { sender: "Beth", message: "Yes! Let's talk about space!", isUser: true, creatureType: "frog" },
  { sender: "Frog", message: "Did you know frogs have been to space? True story! 🚀🐸", isUser: false, creatureType: "frog", streaming: true },
  { sender: "Owl", message: "Indeed. NASA launched frogs into orbit in 1970 to study weightlessness. Fascinating.", isUser: false, creatureType: "owl", streaming: true },
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

const TwoPlayerScreen: React.FC = () => {
  const [phase, setPhase] = useState<Phase>("scanning");
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [showThinking, setShowThinking] = useState(false);
  const [speakingCreature, setSpeakingCreature] = useState<CreatureType | null>(null);
  const [scriptIndex, setScriptIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Phase progression timers
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase("detected"), 2500));
    timers.push(setTimeout(() => setPhase("pairing"), 4500));
    timers.push(setTimeout(() => setPhase("connected"), 6500));
    timers.push(setTimeout(() => setPhase("chat"), 8000));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Chat script playback
  useEffect(() => {
    if (phase !== "chat" || scriptIndex >= chatMessages.length) {
      // After all messages, trigger departure
      if (phase === "chat" && scriptIndex >= chatMessages.length) {
        const t = setTimeout(() => setPhase("departing"), 3000);
        return () => clearTimeout(t);
      }
      return;
    }
    const msg = chatMessages[scriptIndex];
    const delay = scriptIndex === 0 ? 600 : 2200;

    if (!msg.isUser) {
      const t1 = setTimeout(() => { setShowThinking(true); setSpeakingCreature(msg.creatureType); }, delay);
      const t2 = setTimeout(() => {
        setShowThinking(false);
        setVisibleMessages((prev) => [...prev, msg]);
        setTimeout(() => setSpeakingCreature(null), 2000);
        setScriptIndex((i) => i + 1);
      }, delay + 2000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      const t = setTimeout(() => { setVisibleMessages((prev) => [...prev, msg]); setScriptIndex((i) => i + 1); }, delay);
      return () => clearTimeout(t);
    }
  }, [phase, scriptIndex]);

  // Departure → ended
  useEffect(() => {
    if (phase !== "departing") return;
    const t = setTimeout(() => setPhase("ended"), 3500);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleMessages, showThinking]);

  const isPreChat = ["scanning", "detected", "pairing", "connected"].includes(phase);

  return (
    <>
      {/* Background creatures - only visible during chat */}
      <FrogCreature
        opacity={phase === "chat" ? 0.2 : 0}
        size={300}
        speaking={speakingCreature === "frog"}
        className="top-[5%] left-[2%] transition-opacity duration-[1500ms]"
      />
      <OwlCreature
        opacity={phase === "chat" ? 0.2 : 0}
        speaking={speakingCreature === "owl"}
        className="top-[5%] right-[2%] transition-opacity duration-[1500ms]"
      />

      <div className="relative z-10 flex flex-col h-full">
        <AnimatePresence mode="wait">
          {/* Discovery & Pairing Phases */}
          {isPreChat && (
            <motion.div
              key="discovery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 flex flex-col items-center justify-center px-6"
            >
              {/* Scanning animation */}
              {phase === "scanning" && (
                <motion.div className="flex flex-col items-center gap-6">
                  <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
                    <PulseRing color="hsla(120, 40%, 50%, 0.4)" delay={0} />
                    <PulseRing color="hsla(120, 40%, 50%, 0.3)" delay={0.7} />
                    <PulseRing color="hsla(120, 40%, 50%, 0.2)" delay={1.4} />
                    <motion.div
                      className="w-10 h-10 rounded-full"
                      style={{ background: "hsla(120, 40%, 50%, 0.6)", boxShadow: "0 0 30px hsla(120, 40%, 50%, 0.3)" }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                  <p className="text-[16px] text-muted-foreground/60" style={fontStyle}>
                    Looking for nearby Craitures…
                  </p>
                </motion.div>
              )}

              {/* Detected */}
              {phase === "detected" && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-5"
                >
                  <motion.div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-[36px]"
                    style={{ background: "hsla(120, 40%, 50%, 0.15)", border: "2px solid hsla(120, 40%, 50%, 0.3)" }}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    🦉
                  </motion.div>
                  <div className="text-center">
                    <p className="text-[18px] font-semibold text-foreground/90" style={fontStyle}>
                      Craiture detected!
                    </p>
                    <p className="text-[14px] text-muted-foreground/50 mt-1" style={fontStyle}>
                      Chloe's Owl is nearby
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Pairing */}
              {phase === "pairing" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div className="flex items-center gap-4">
                    <motion.span className="text-[40px]" animate={{ x: [0, 8, 0] }} transition={{ duration: 1, repeat: Infinity }}>🐸</motion.span>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ background: "hsla(120, 40%, 50%, 0.5)" }}
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                        />
                      ))}
                    </div>
                    <motion.span className="text-[40px]" animate={{ x: [0, -8, 0] }} transition={{ duration: 1, repeat: Infinity }}>🦉</motion.span>
                  </div>
                  <p className="text-[16px] text-muted-foreground/60" style={fontStyle}>
                    Syncing…
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
                    <p className="text-[18px] font-semibold text-foreground/90" style={fontStyle}>
                      Playdate started!
                    </p>
                    <p className="text-[13px] text-muted-foreground/40 mt-1" style={fontStyle}>
                      Beth + Frog 🐸 &nbsp;·&nbsp; Chloe + Owl 🦉
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Chat phase */}
          {phase === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex-1 flex flex-col h-full"
            >
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
            <motion.div
              key="departing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 gap-5"
            >
              <div className="flex items-center gap-8">
                <motion.span
                  className="text-[40px]"
                  animate={{ x: -40, opacity: 0 }}
                  transition={{ duration: 2.5, ease: "easeIn" }}
                >
                  🐸
                </motion.span>
                <motion.span
                  className="text-[40px]"
                  animate={{ x: 40, opacity: 0 }}
                  transition={{ duration: 2.5, ease: "easeIn" }}
                >
                  🦉
                </motion.span>
              </div>
              <p className="text-[16px] text-muted-foreground/60" style={fontStyle}>
                Chloe's Owl moved away…
              </p>
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

          {/* Ended — back to single chat */}
          {phase === "ended" && (
            <motion.div
              key="ended"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex-1 flex flex-col items-center justify-center px-6 gap-4"
            >
              <FrogCreature opacity={0.25} size={300} speaking={false} className="top-[10%] left-1/2 -translate-x-1/2" />
              <p className="text-[16px] text-muted-foreground/60 relative z-10" style={fontStyle}>
                Just you and Frog again 🐸
              </p>
              <p className="text-[12px] text-muted-foreground/30 relative z-10" style={fontStyle}>
                All playdate messages were erased
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default TwoPlayerScreen;
