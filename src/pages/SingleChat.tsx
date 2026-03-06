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

const scriptedResponses: Record<string, string> = {
  default: "Ribbit! That's a great question. Let me think about it... 🐸",
};

const initialMessages: Message[] = [
  { sender: "Frog", message: "Hi there Beth! What's on your mind today? 🐸", isUser: false, streaming: true },
];

const SingleChat: React.FC = () => {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [showThinking, setShowThinking] = useState(false);
  const [speakingCreature, setSpeakingCreature] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [demoStarted, setDemoStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDemoStarted(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Show initial greeting
  useEffect(() => {
    if (!demoStarted) return;
    setSpeakingCreature(true);
    setShowThinking(true);
    const t = setTimeout(() => {
      setShowThinking(false);
      setVisibleMessages([initialMessages[0]]);
      setTimeout(() => setSpeakingCreature(false), 2000);
    }, 1500);
    return () => clearTimeout(t);
  }, [demoStarted]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleMessages, showThinking]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg: Message = { sender: "Beth", message: inputValue.trim(), isUser: true };
    setVisibleMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // Simulate frog response
    setTimeout(() => {
      setShowThinking(true);
      setSpeakingCreature(true);
    }, 600);
    setTimeout(() => {
      setShowThinking(false);
      const response: Message = {
        sender: "Frog",
        message: scriptedResponses.default,
        isUser: false,
        streaming: true,
      };
      setVisibleMessages((prev) => [...prev, response]);
      setTimeout(() => setSpeakingCreature(false), 2000);
    }, 2400);
  };

  return (
    <DeviceFrame>
      <BackButton />
      <FrogCreature
        opacity={0.25}
        size={400}
        speaking={speakingCreature}
        className="top-[10%] left-1/2 -translate-x-1/2"
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-center py-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-creature-frog-glow" />
            <span className="text-[17px] text-foreground/80 font-semibold" style={{ fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" }}>
              Beth & Frog
            </span>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-2"
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

        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          placeholder="Type a message..."
        />
      </div>
    </DeviceFrame>
  );
};

export default SingleChat;
