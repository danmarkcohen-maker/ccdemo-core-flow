import React, { useState, useEffect, useRef } from "react";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import ChatBubble from "@/components/craiture/ChatBubble";
import ThinkingDots from "@/components/craiture/ThinkingDots";
import ChatInput from "@/components/craiture/ChatInput";

export interface ChatMessage {
  sender: string;
  message: string;
  isUser: boolean;
  streaming?: boolean;
}

interface ChatScreenProps {
  userName: string;
  messages: ChatMessage[];
  onMessagesChange: (msgs: ChatMessage[]) => void;
  resumeMode?: boolean;
}

const scriptedResponses: Record<string, string> = {
  default: "Ribbit! That's a great question. Let me think about it... 🐸",
};

const ChatScreen: React.FC<ChatScreenProps> = ({ userName, messages, onMessagesChange, resumeMode = false }) => {
  const [showThinking, setShowThinking] = useState(false);
  const [speakingCreature, setSpeakingCreature] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [greeted, setGreeted] = useState(resumeMode || messages.length > 0);

  // Initial greeting
  useEffect(() => {
    if (greeted) return;
    const t1 = setTimeout(() => {
      setSpeakingCreature(true);
      setShowThinking(true);
    }, 800);
    const t2 = setTimeout(() => {
      setShowThinking(false);
      onMessagesChange([{
        sender: "Frog",
        message: `Hey ${userName}! What's on your mind? 🐸`,
        isUser: false,
        streaming: true,
      }]);
      setGreeted(true);
      setTimeout(() => setSpeakingCreature(false), 2000);
    }, 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [greeted, userName, onMessagesChange]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, showThinking]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg: ChatMessage = { sender: userName, message: inputValue.trim(), isUser: true };
    onMessagesChange([...messages, userMsg]);
    setInputValue("");

    setTimeout(() => {
      setShowThinking(true);
      setSpeakingCreature(true);
    }, 600);
    setTimeout(() => {
      setShowThinking(false);
      const response: ChatMessage = {
        sender: "Frog",
        message: scriptedResponses.default,
        isUser: false,
        streaming: true,
      };
      onMessagesChange([...messages, userMsg, response]);
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
          {messages.map((msg, i) => (
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
