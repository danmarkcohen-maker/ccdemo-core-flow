import React, { useEffect, useState } from "react";

export type CreatureType = "frog" | "owl" | "robot" | "fox";

interface ChatBubbleProps {
  sender: string;
  message: string;
  isUser: boolean;
  creatureType?: CreatureType;
  streaming?: boolean;
  liveStream?: boolean;
  delay?: number;
}

const bubbleColors: Record<string, string> = {
  user: "bg-bubble-user",
  frog: "bg-bubble-frog",
  owl: "bg-bubble-owl",
  robot: "bg-bubble-robot",
  fox: "bg-bubble-fox",
};

const accentDots: Record<string, string> = {
  frog: "bg-creature-frog-glow",
  owl: "bg-creature-owl-glow",
  robot: "bg-creature-robot-glow",
  fox: "bg-creature-fox-glow",
};

const ChatBubble: React.FC<ChatBubbleProps> = ({
  sender,
  message,
  isUser,
  creatureType = "frog",
  streaming = false,
  liveStream = false,
  delay = 0,
}) => {
  const [displayedText, setDisplayedText] = useState(streaming && !liveStream ? "" : message);
  const [visible, setVisible] = useState(delay === 0);
  const [streamDone, setStreamDone] = useState(!streaming && !liveStream);

  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [delay]);

  // Character-by-character animation for pre-known strings
  useEffect(() => {
    if (!visible || !streaming || liveStream) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(message.slice(0, i));
      if (i >= message.length) {
        clearInterval(interval);
        setStreamDone(true);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [visible, streaming, liveStream, message]);

  if (!visible) return null;

  const bgColor = isUser ? bubbleColors.user : bubbleColors[creatureType] || bubbleColors.frog;
  const showCursor = liveStream || (streaming && !streamDone);
  const text = liveStream ? message : (streaming ? displayedText : message);

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
      style={{ animation: "message-appear 0.3s ease-out" }}
    >
      <div className={`max-w-[82%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-1.5 mb-1 px-2 ${isUser ? "justify-end" : "justify-start"}`}>
          {!isUser && (
            <div className={`w-2 h-2 rounded-full ${accentDots[creatureType] || accentDots.frog}`} />
          )}
          <span className="text-[13px] text-muted-foreground font-semibold">
            {sender}
          </span>
        </div>
        <div
          className={`${bgColor} px-5 py-3.5 rounded-[22px] text-[18px] leading-relaxed text-foreground`}
          style={{
            fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
            boxShadow: isUser
              ? "0 2px 12px hsla(0, 0%, 0%, 0.15)"
              : "0 2px 16px hsla(0, 0%, 0%, 0.25)",
          }}
        >
          {text}
          {showCursor && (
            <span className="inline-block w-[2px] h-[18px] bg-foreground/40 ml-0.5 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
