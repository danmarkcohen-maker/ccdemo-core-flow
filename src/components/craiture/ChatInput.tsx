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
  placeholder = "> Type your message...",
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-2.5 p-3.5 bg-background/60 backdrop-blur-md border-t border-border/20">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend?.()}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-secondary/80 rounded-2xl px-5 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none border border-border/30 focus:border-creature-frog-glow/50 transition-all duration-300"
        style={{
          boxShadow: "inset 0 2px 8px hsla(0, 0%, 0%, 0.15)",
        }}
      />
      <button
        onClick={onSend}
        disabled={disabled || !value}
        className="w-10 h-10 rounded-2xl bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 disabled:opacity-20"
      >
        <Send size={16} />
      </button>
    </div>
  );
};

export default ChatInput;
