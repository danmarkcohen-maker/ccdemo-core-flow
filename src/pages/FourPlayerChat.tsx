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
  { sender: "Robot", message: "Processing query... That depends on the environment. Speed varies by medium — land, air, or water.", isUser: false, creatureType: "robot", streaming: true },
  { sender: "Fox", message: "On land, the cheetah takes the crown. Up to 112 km/h — now that's what I call quick!", isUser: false, creatureType: "fox", streaming: true },
  { sender: "Owl", message: "But in the air, the peregrine falcon dives at over 380 km/h. Truly the fastest creature alive.", isUser: false, creatureType: "owl", streaming: true },
  { sender: "Beth", message: "What about in the water?", isUser: true, creatureType: "frog" },
  { sender: "Frog", message: "Ribbit! The sailfish swims at about 110 km/h. Almost as fast as a cheetah runs!", isUser: false, creatureType: "frog", streaming: true },
  { sender: "Leo", message: "Which one would win in a race?", isUser: true, creatureType: "fox" },
  { sender: "Robot", message: "Insufficient data. The variables are incompatible. But the falcon's dive speed would win any combined metric.", isUser: false, creatureType: "robot", streaming: true },
];

const FourPlayerChat: React.FC = () => {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [showThinking, setShowThinking] = useState(false);
  const [speakingCreature, setSpeakingCreature] = useState<CreatureType | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scriptIndex, setScriptIndex] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setTimeout(() => setEntered(true), 1500);
  }, []);

  useEffect(() => {
    if (!entered || scriptIndex >= scriptedMessages.length) return;
    const msg = scriptedMessages[scriptIndex];
    const delay = scriptIndex === 0 ? 800 : 2200;

    if (!msg.isUser) {
      const t1 = setTimeout(() => {
        setShowThinking(true);
        setSpeakingCreature(msg.creatureType);
      }, delay);
      const t2 = setTimeout(() => {
        setShowThinking(false);
        setVisibleMessages((prev) => [...prev, msg]);
        setTimeout(() => setSpeakingCreature(null), 2000);
        setScriptIndex((i) => i + 1);
      }, delay + 2200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      const t = setTimeout(() => {
        setVisibleMessages((prev) => [...prev, msg]);
        setScriptIndex((i) => i + 1);
      }, delay);
      return () => clearTimeout(t);
    }
  }, [entered, scriptIndex]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleMessages, showThinking]);

  return (
    <DeviceFrame>
      <BackButton />
      <FrogCreature opacity={0.08} speaking={speakingCreature === "frog"} className="top-[5%] left-[5%]" />
      <OwlCreature opacity={entered ? 0.08 : 0} speaking={speakingCreature === "owl"} className="top-[5%] right-[5%] transition-opacity duration-[2000ms]" />
      <RobotCreature opacity={entered ? 0.08 : 0} speaking={speakingCreature === "robot"} className="bottom-[15%] left-[5%] transition-opacity duration-[2000ms]" style={{ transitionDelay: "500ms" }} />
      <FoxCreature opacity={entered ? 0.08 : 0} speaking={speakingCreature === "fox"} className="bottom-[15%] right-[5%] transition-opacity duration-[2000ms]" style={{ transitionDelay: "1000ms" }} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-center py-4 border-b border-border/30">
          <div className="text-xs text-muted-foreground tracking-widest uppercase">
            Playdate · Beth, Chloe, Sam & Leo
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollBehavior: "smooth" }}>
          {visibleMessages.map((msg, i) => (
            <ChatBubble
              key={i}
              sender={msg.sender}
              message={msg.message}
              isUser={msg.isUser}
              creatureType={msg.creatureType}
              streaming={msg.streaming}
            />
          ))}
          {showThinking && <ThinkingDots />}
        </div>

        <ChatInput placeholder="> Type your message..." />
      </div>
    </DeviceFrame>
  );
};

export default FourPlayerChat;
