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

type Phase = "hi-five" | "confirm" | "connected" | "chat" | "departing";

interface TwoPlayerScreenProps {
  onExit: () => void;
}

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

const TwoPlayerScreen: React.FC<TwoPlayerScreenProps> = ({ onExit }) => {
  const [phase, setPhase] = useState<Phase>("hi-five");
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [showThinking, setShowThinking] = useState(false);
  const [speakingCreature, setSpeakingCreature] = useState<CreatureType | null>(null);
  const [scriptIndex, setScriptIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hi-Five flow
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase("confirm"), 1000));
    timers.push(setTimeout(() => setPhase("connected"), 2800));
    timers.push(setTimeout(() => setPhase("chat"), 4500));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Chat script playback
  useEffect(() => {
    if (phase !== "chat" || scriptIndex >= chatMessages.length) return;
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

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleMessages, showThinking]);

  // Departing → exit
  useEffect(() => {
    if (phase !== "departing") return;
    const t = setTimeout(() => onExit(), 3000);
    return () => clearTimeout(t);
  }, [phase, onExit]);

  const isPreChat = ["hi-five", "confirm", "connected"].includes(phase);

  return (
    <>
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

              {/* Confirmation */}
              {phase === "confirm" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[36px]">🐸</span>
                    <span className="text-[20px] text-muted-foreground/40">×</span>
                    <span className="text-[36px]">🦉</span>
                  </div>
                  <p className="text-[18px] font-semibold text-foreground/85 text-center" style={fontStyle}>
                    Hi-Five with Chloe and her Owl?
                  </p>
                  <motion.div
                    className="px-8 py-3 rounded-full text-[16px] font-semibold text-foreground/90"
                    style={{
                      background: "hsla(120, 40%, 40%, 0.3)",
                      border: "2px solid hsla(120, 40%, 50%, 0.4)",
                      ...fontStyle,
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Yes! ✨
                  </motion.div>
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
                      Hi-Five! Playdate started!
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
              className="flex-1 flex flex-col h-full min-h-0"
            >
              <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4" style={{ scrollBehavior: "smooth" }}>
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
                <motion.span className="text-[40px]" animate={{ x: -40, opacity: 0 }} transition={{ duration: 2.5, ease: "easeIn" }}>🐸</motion.span>
                <motion.span className="text-[40px]" animate={{ x: 40, opacity: 0 }} transition={{ duration: 2.5, ease: "easeIn" }}>🦉</motion.span>
              </div>
              <p className="text-[16px] text-muted-foreground/60" style={fontStyle}>Chloe's Owl waved goodbye…</p>
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
        </AnimatePresence>
      </div>
    </>
  );
};

export default TwoPlayerScreen;
