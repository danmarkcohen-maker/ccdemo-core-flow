import React, { useState, useEffect, useRef } from "react";
import DeviceFrame from "@/components/craiture/DeviceFrame";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import OwlCreature from "@/components/craiture/creatures/OwlCreature";
import RobotCreature from "@/components/craiture/creatures/RobotCreature";
import FoxCreature from "@/components/craiture/creatures/FoxCreature";
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
  { sender: "Sam", message: "What's the fastest animal?", isUser: true, creatureType: "robot" },
  { sender: "Robot", message: "Speed varies by medium — land, air, or water.", isUser: false, creatureType: "robot", streaming: true },
  { sender: "Fox", message: "On land, the cheetah — 112 km/h! 🦊", isUser: false, creatureType: "fox", streaming: true },
  { sender: "Owl", message: "In the air, the peregrine falcon dives at 380 km/h.", isUser: false, creatureType: "owl", streaming: true },
  { sender: "Beth", message: "What about in the water?", isUser: true, creatureType: "frog" },
  { sender: "Frog", message: "The sailfish! About 110 km/h 🐸", isUser: false, creatureType: "frog", streaming: true },
];

const fontStyle = { fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" };

const FourPlayerChat: React.FC = () => {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [showThinking, setShowThinking] = useState(false);
  const [speakingCreature, setSpeakingCreature] = useState<CreatureType | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scriptIndex, setScriptIndex] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => { setTimeout(() => setEntered(true), 1500); }, []);

  useEffect(() => {
    if (!entered || scriptIndex >= scriptedMessages.length) return;
    const msg = scriptedMessages[scriptIndex];
    const delay = scriptIndex === 0 ? 800 : 2200;
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
  }, [entered, scriptIndex]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [visibleMessages, showThinking]);

  return (
    <DeviceFrame>
      <BackButton />
      <FrogCreature opacity={0.14} size={240} speaking={speakingCreature === "frog"} className="top-[3%] left-[2%]" />
      <OwlCreature opacity={entered ? 0.14 : 0} speaking={speakingCreature === "owl"} className="top-[3%] right-[2%] transition-opacity duration-[2000ms]" />
      <RobotCreature opacity={entered ? 0.14 : 0} speaking={speakingCreature === "robot"} className="bottom-[12%] left-[2%] transition-opacity duration-[2000ms]" />
      <FoxCreature opacity={entered ? 0.14 : 0} speaking={speakingCreature === "fox"} className="bottom-[12%] right-[2%] transition-opacity duration-[2000ms]" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-center py-3">
          <div className="flex items-center gap-2">
            {[
              { name: "Beth", color: "bg-creature-frog-glow" },
              { name: "Chloe", color: "bg-creature-owl-glow" },
              { name: "Sam", color: "bg-creature-robot-glow" },
              { name: "Leo", color: "bg-creature-fox-glow" },
            ].map((p, i) => (
              <React.Fragment key={p.name}>
                {i > 0 && <span className="text-muted-foreground/20">·</span>}
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${p.color}`} />
                  <span className="text-[13px] text-foreground/55 font-medium" style={fontStyle}>{p.name}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2" style={{ scrollBehavior: "smooth" }}>
          {visibleMessages.map((msg, i) => (
            <ChatBubble key={i} sender={msg.sender} message={msg.message} isUser={msg.isUser} creatureType={msg.creatureType} streaming={msg.streaming} />
          ))}
          {showThinking && <ThinkingDots />}
        </div>

        <ChatInput placeholder="Type a message..." />
      </div>
    </DeviceFrame>
  );
};

export default FourPlayerChat;
