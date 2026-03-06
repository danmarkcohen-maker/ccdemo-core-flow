import React from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  value?: string;
  onChange?: (val: string) => void;
  onSend?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value = "",
  onChange,
  onSend,
  placeholder = "Type a message...",
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-background/70 backdrop-blur-md border-t border-white/[0.06]">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend?.()}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-secondary/80 rounded-full px-6 py-3.5 text-[18px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-white/[0.06] focus:border-creature-frog-glow/50 transition-all duration-300"
        style={{
          fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
          boxShadow: "inset 0 2px 8px hsla(0, 0%, 0%, 0.2)",
        }}
      />
      <button
        onClick={onSend}
        disabled={disabled || !value}
        className="w-12 h-12 rounded-full bg-creature-frog flex items-center justify-center text-foreground hover:bg-creature-frog-glow transition-all duration-200 disabled:opacity-20 active:scale-90"
        style={{
          boxShadow: "0 4px 15px hsla(120, 30%, 30%, 0.3)",
        }}
      >
        <Send size={20} />
      </button>
    </div>
  );
};

export default ChatInput;
