import React, { useState, useEffect, useRef } from "react";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import ChatBubble from "@/components/craiture/ChatBubble";
import ThinkingDots from "@/components/craiture/ThinkingDots";
import ChatInput from "@/components/craiture/ChatInput";

interface ChatScreenProps {
  userName: string;
  resumeMode?: boolean;
}

interface Message {
  sender: string;
  message: string;
  isUser: boolean;
  streaming?: boolean;
}

const scriptedResponses: Record<string, string> = {
  default: "Ribbit! That's a great question. Let me think about it... 🐸",
};

const resumeHistory: Message[] = [
  { sender: "Beth", message: "Do you think clouds have feelings?", isUser: true },
  { sender: "Frog", message: "Ribbit! I think they feel light and fluffy… until they get angry and rain on everyone 🌧️🐸", isUser: false },
  { sender: "Beth", message: "Haha that's kind of beautiful actually", isUser: true },
  { sender: "Frog", message: "You're kind of beautiful actually ✨🐸", isUser: false },
  { sender: "Beth", message: "Aww stop it 😊", isUser: true },
  { sender: "Frog", message: "Never! Compliments are free and I have unlimited supply 🐸💚", isUser: false },
];

const ChatScreen: React.FC<ChatScreenProps> = ({ userName, resumeMode = false }) => {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>(
    resumeMode ? resumeHistory : []
  );
  const [showThinking, setShowThinking] = useState(false);
  const [speakingCreature, setSpeakingCreature] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [demoStarted, setDemoStarted] = useState(resumeMode);

  useEffect(() => {
    if (resumeMode) return;
    const t = setTimeout(() => setDemoStarted(true), 800);
    return () => clearTimeout(t);
  }, [resumeMode]);

  useEffect(() => {
    if (!demoStarted || resumeMode) return;
    setSpeakingCreature(true);
    setShowThinking(true);
    const t = setTimeout(() => {
      setShowThinking(false);
      setVisibleMessages([{
        sender: "Frog",
        message: `Hey ${userName}! What's on your mind? 🐸`,
        isUser: false,
        streaming: true,
      }]);
      setTimeout(() => setSpeakingCreature(false), 2000);
    }, 1500);
    return () => clearTimeout(t);
  }, [demoStarted, userName, resumeMode]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleMessages, showThinking]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg: Message = { sender: userName, message: inputValue.trim(), isUser: true };
    setVisibleMessages((prev) => [...prev, userMsg]);
    setInputValue("");

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
    <div className="relative h-full overflow-hidden">
      <FrogCreature
        opacity={0.25}
        size={400}
        speaking={speakingCreature}
        className="top-[10%] left-1/2 -translate-x-1/2"
      />

      <div className="relative z-10 flex flex-col h-full">
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto px-4 py-4"
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
    </div>
  );
};

export default ChatScreen;
