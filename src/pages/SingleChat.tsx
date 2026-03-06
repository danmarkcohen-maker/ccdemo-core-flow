import React, { useState, useEffect, useRef } from "react";
import DeviceFrame from "@/components/craiture/DeviceFrame";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import ChatBubble from "@/components/craiture/ChatBubble";
import ThinkingDots from "@/components/craiture/ThinkingDots";
import ChatInput from "@/components/craiture/ChatInput";
import BackButton from "@/components/craiture/BackButton";

interface Message {
  sender: string;
  message: string;
  isUser: boolean;
  streaming?: boolean;
}

const scriptedMessages: Message[] = [
  { sender: "Frog", message: "Hi there Beth! What's on your mind?", isUser: false, streaming: true },
  { sender: "Beth", message: "Why do frogs jump?", isUser: true },
  { sender: "Frog", message: "Ribbit! Frogs jump because their legs are extremely powerful. Our back legs can be longer than our entire body, which gives us incredible spring. It's like having built-in trampolines!", isUser: false, streaming: true },
];

const SingleChat: React.FC = () => {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [showThinking, setShowThinking] = useState(false);
  const [speakingCreature, setSpeakingCreature] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scriptIndex, setScriptIndex] = useState(0);
  const [demoStarted, setDemoStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDemoStarted(true), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!demoStarted || scriptIndex >= scriptedMessages.length) return;
    const msg = scriptedMessages[scriptIndex];
    const baseDelay = scriptIndex === 0 ? 500 : 1500;

    if (!msg.isUser) {
      const t1 = setTimeout(() => {
        setShowThinking(true);
        setSpeakingCreature(true);
      }, baseDelay);
      const t2 = setTimeout(() => {
        setShowThinking(false);
        setVisibleMessages((prev) => [...prev, msg]);
        setTimeout(() => setSpeakingCreature(false), 2000);
        setScriptIndex((i) => i + 1);
      }, baseDelay + 1800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      const t = setTimeout(() => {
        setVisibleMessages((prev) => [...prev, msg]);
        setScriptIndex((i) => i + 1);
      }, baseDelay);
      return () => clearTimeout(t);
    }
  }, [demoStarted, scriptIndex]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleMessages, showThinking]);

  return (
    <DeviceFrame>
      <BackButton />
      <FrogCreature
        opacity={0.25}
        size={480}
        speaking={speakingCreature}
        className="top-[12%] left-1/2 -translate-x-1/2"
      />

      {/* Ambient gradient overlay */}
      <div
        className="absolute top-0 left-0 right-0 h-32 z-[2] pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, hsla(120, 25%, 15%, 0.15) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-creature-frog-glow" />
            <span className="text-sm text-foreground/70 font-light">Beth & Frog</span>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3"
          style={{ scrollBehavior: "smooth" }}
        >
          {visibleMessages.map((msg, i) => (
            <ChatBubble
              key={i}
              sender={msg.sender}
              message={msg.message}
              isUser={msg.isUser}
              creatureType="frog"
              streaming={msg.streaming}
            />
          ))}
          {showThinking && <ThinkingDots />}
        </div>

        <ChatInput value={inputValue} onChange={setInputValue} placeholder="> Type your message..." />
      </div>
    </DeviceFrame>
  );
};

export default SingleChat;
