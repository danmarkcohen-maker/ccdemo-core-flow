import React, { useEffect, useState } from "react";

export type CreatureType = "frog" | "owl" | "robot" | "fox";

interface ChatBubbleProps {
  sender: string;
  message: string;
  isUser: boolean;
  creatureType?: CreatureType;
  streaming?: boolean;
  delay?: number;
}

const bubbleColors: Record<string, string> = {
  user: "bg-bubble-user",
  frog: "bg-bubble-frog",
  owl: "bg-bubble-owl",
  robot: "bg-bubble-robot",
  fox: "bg-bubble-fox",
};

const ChatBubble: React.FC<ChatBubbleProps> = ({
  sender,
  message,
  isUser,
  creatureType = "frog",
  streaming = false,
  delay = 0,
}) => {
  const [displayedText, setDisplayedText] = useState(streaming ? "" : message);
  const [visible, setVisible] = useState(delay === 0);
  const [streamDone, setStreamDone] = useState(!streaming);

  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [delay]);

  useEffect(() => {
    if (!visible || !streaming) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(message.slice(0, i));
      if (i >= message.length) {
        clearInterval(interval);
        setStreamDone(true);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [visible, streaming, message]);

  if (!visible) return null;

  const bgColor = isUser ? bubbleColors.user : bubbleColors[creatureType] || bubbleColors.frog;

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
      style={{ animation: "message-appear 0.25s ease-out" }}
    >
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div className="text-[10px] text-muted-foreground mb-1 px-3 font-medium tracking-wide uppercase">
          {sender}
        </div>
        <div
          className={`${bgColor} px-4 py-2.5 rounded-2xl text-sm leading-relaxed text-foreground`}
          style={{
            boxShadow: "0 2px 8px hsla(0, 0%, 0%, 0.2)",
          }}
        >
          {streaming ? displayedText : message}
          {streaming && !streamDone && (
            <span className="inline-block w-[2px] h-[14px] bg-foreground/50 ml-0.5 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
