import React, { useState, useEffect, useRef } from "react";
import DeviceFrame from "@/components/craiture/DeviceFrame";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import OwlCreature from "@/components/craiture/creatures/OwlCreature";
import ChatBubble from "@/components/craiture/ChatBubble";
import ThinkingDots from "@/components/craiture/ThinkingDots";
import ChatInput from "@/components/craiture/ChatInput";
import BackButton from "@/components/craiture/BackButton";
import type { CreatureType } from "@/components/craiture/ChatBubble";

interface Message {
  sender: string;
  message: string;
  isUser: boolean;
  creatureType: CreatureType;
  streaming?: boolean;
}

const scriptedMessages: Message[] = [
  { sender: "Beth", message: "Why do frogs jump?", isUser: true, creatureType: "frog" },
  { sender: "Frog", message: "Ribbit! Frogs have incredibly powerful legs designed for jumping. It's how we escape predators and catch insects!", isUser: false, creatureType: "frog", streaming: true },
  { sender: "Chloe", message: "Are frogs good jumpers compared to other animals?", isUser: true, creatureType: "owl" },
  { sender: "Owl", message: "Excellent question! Frogs are among the best jumpers relative to their body size. Some species can leap over 20 times their own length.", isUser: false, creatureType: "owl", streaming: true },
];

const TwoPlayerChat: React.FC = () => {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [showThinking, setShowThinking] = useState(false);
  const [speakingCreature, setSpeakingCreature] = useState<CreatureType | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scriptIndex, setScriptIndex] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => { setTimeout(() => setEntered(true), 1200); }, []);

  useEffect(() => {
    if (!entered || scriptIndex >= scriptedMessages.length) return;
    const msg = scriptedMessages[scriptIndex];
    const delay = scriptIndex === 0 ? 800 : 2000;
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
  }, [entered, scriptIndex]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [visibleMessages, showThinking]);

  return (
    <DeviceFrame>
      <BackButton />
      <FrogCreature opacity={0.2} size={350} speaking={speakingCreature === "frog"} className="top-[8%] left-[2%]" />
      <OwlCreature opacity={entered ? 0.2 : 0} speaking={speakingCreature === "owl"} className="top-[8%] right-[2%] transition-opacity duration-[2000ms]" />

      <div className="absolute top-0 left-0 right-0 h-28 z-[2] pointer-events-none" style={{ background: "linear-gradient(to bottom, hsla(120, 20%, 12%, 0.1) 0%, transparent 100%)" }} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-creature-frog-glow" />
              <span className="text-xs text-foreground/60">Beth</span>
            </div>
            <span className="text-muted-foreground/30">·</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-creature-owl-glow" />
              <span className="text-xs text-foreground/60">Chloe</span>
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollBehavior: "smooth" }}>
          {visibleMessages.map((msg, i) => (
            <ChatBubble key={i} sender={msg.sender} message={msg.message} isUser={msg.isUser} creatureType={msg.creatureType} streaming={msg.streaming} />
          ))}
          {showThinking && <ThinkingDots />}
        </div>

        <ChatInput placeholder="> Type your message..." />
      </div>
    </DeviceFrame>
  );
};

export default TwoPlayerChat;
