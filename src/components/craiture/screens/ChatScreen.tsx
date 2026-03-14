import React, { useState, useEffect, useRef } from "react";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import ChatBubble from "@/components/craiture/ChatBubble";
import ThinkingDots from "@/components/craiture/ThinkingDots";
import ChatInput from "@/components/craiture/ChatInput";
import { streamFrogChat } from "@/lib/streamFrogChat";
import { toast } from "sonner";

export interface ChatMessage {
  sender: string;
  message: string;
  isUser: boolean;
  streaming?: boolean;
  liveStream?: boolean;
}

interface ChatScreenProps {
  userName: string;
  messages: ChatMessage[];
  onMessagesChange: (msgs: ChatMessage[]) => void;
  resumeMode?: boolean;
  systemPrompt?: string;
  onUsage?: (userMsgLength: number, assistantMsgLength: number, usage?: import("@/lib/streamFrogChat").UsageData) => void;
  onResponseComplete?: (messages: { role: "user" | "assistant"; content: string }[]) => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ userName, messages, onMessagesChange, resumeMode = false, systemPrompt, onUsage, onResponseComplete }) => {
  const [showThinking, setShowThinking] = useState(false);
  const [speakingCreature, setSpeakingCreature] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [greeted, setGreeted] = useState(resumeMode || messages.length > 0);
  const assistantBufferRef = useRef("");

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

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return;
    const userText = inputValue.trim();
    const userMsg: ChatMessage = { sender: userName, message: userText, isUser: true };
    const updatedMessages = [...messages, userMsg];
    onMessagesChange(updatedMessages);
    setInputValue("");
    setIsStreaming(true);

    // Show thinking after brief delay
    setTimeout(() => {
      setShowThinking(true);
      setSpeakingCreature(true);
    }, 400);

    // Build conversation history for the API (last 10 messages)
    const apiMessages = updatedMessages.map((m) => ({
      role: m.isUser ? "user" as const : "assistant" as const,
      content: m.message,
    }));

    assistantBufferRef.current = "";
    let firstDelta = true;
    let usageData: import("@/lib/streamFrogChat").UsageData | undefined;

    await streamFrogChat({
      messages: apiMessages,
      systemPrompt,
      onUsage: (u) => { usageData = u; },
      onDelta: (chunk) => {
        if (firstDelta) {
          firstDelta = false;
          setShowThinking(false);
          // Add initial assistant message
          assistantBufferRef.current = chunk;
          onMessagesChange([
            ...updatedMessages,
            { sender: "Frog", message: chunk, isUser: false, liveStream: true },
          ]);
        } else {
          assistantBufferRef.current += chunk;
          onMessagesChange([
            ...updatedMessages,
            { sender: "Frog", message: assistantBufferRef.current, isUser: false, liveStream: true },
          ]);
        }
      },
      onDone: () => {
        setShowThinking(false);
        setIsStreaming(false);
        setSpeakingCreature(false);
        // Finalize: remove liveStream flag
        if (assistantBufferRef.current) {
          onMessagesChange([
            ...updatedMessages,
            { sender: "Frog", message: assistantBufferRef.current, isUser: false },
          ]);
          onUsage?.(userText.length, assistantBufferRef.current.length, usageData);
        }
      },
      onError: (error) => {
        toast.error(error);
        setShowThinking(false);
        setIsStreaming(false);
        setSpeakingCreature(false);
      },
    });
  };

  return (
    <div className="relative h-full overflow-hidden" style={{ contain: "strict" }}>
      <FrogCreature
        opacity={0.25}
        size={360}
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
              liveStream={msg.liveStream}
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
