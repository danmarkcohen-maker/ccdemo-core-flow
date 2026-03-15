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
  // Orchestrator props (passed through to streamFrogChat when orchestrator is active)
  storyState?: import("@/lib/storyTypes").StoryState;
  storyArcs?: import("@/lib/storyTypes").StoryArc[];
  safetyGateEnabled?: boolean;
  intentClassificationEnabled?: boolean;
  safetyDeflections?: string;
  onOrchestratorMeta?: (meta: import("@/lib/storyTypes").OrchestratorMeta) => void;
}

const OPENER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-opener`;

const ChatScreen: React.FC<ChatScreenProps> = ({ userName, messages, onMessagesChange, resumeMode = false, systemPrompt, onUsage, onResponseComplete }) => {
  const [showThinking, setShowThinking] = useState(false);
  const [speakingCreature, setSpeakingCreature] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [greeted, setGreeted] = useState(resumeMode || messages.length > 0);
  const assistantBufferRef = useRef("");

  // Initial greeting — fetch from LLM
  useEffect(() => {
    if (greeted) return;

    let cancelled = false;

    const fetchOpener = async () => {
      setSpeakingCreature(true);
      setShowThinking(true);

      // Read age and topics from localStorage for the opener request
      let age = 10;
      let topics: string[] = [];
      try {
        const storedAge = localStorage.getItem("craiture_child_age");
        if (storedAge) age = parseInt(storedAge, 10);
        const storedMemories = localStorage.getItem("craiture_memories");
        if (storedMemories) {
          const mem = JSON.parse(storedMemories);
          if (mem.likes && mem.likes.length > 0) topics = mem.likes;
        }
      } catch {}

      let opener = `Hey ${userName}! What's on your mind? 🐸`;

      try {
        const resp = await fetch(OPENER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ name: userName, age, topics }),
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data.opener) opener = data.opener;
        }
      } catch (e) {
        console.warn("Failed to generate opener, using fallback:", e);
      }

      if (cancelled) return;

      setShowThinking(false);
      onMessagesChange([{
        sender: "Frog",
        message: opener,
        isUser: false,
        streaming: true,
      }]);
      setGreeted(true);
      setTimeout(() => setSpeakingCreature(false), 2000);
    };

    // Small delay before showing thinking
    const t = setTimeout(fetchOpener, 800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
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

    setTimeout(() => {
      setShowThinking(true);
      setSpeakingCreature(true);
    }, 400);

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
        if (assistantBufferRef.current) {
          const finalMessages = [
            ...updatedMessages,
            { sender: "Frog", message: assistantBufferRef.current, isUser: false },
          ];
          onMessagesChange(finalMessages);
          onUsage?.(userText.length, assistantBufferRef.current.length, usageData);
          onResponseComplete?.(finalMessages.map(m => ({
            role: m.isUser ? "user" as const : "assistant" as const,
            content: m.message,
          })));
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
