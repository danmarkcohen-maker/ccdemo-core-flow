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
    <div className="flex items-center gap-2 p-3 bg-background/80 backdrop-blur-sm border-t border-border">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend?.()}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-secondary rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-ring transition-colors"
      />
      <button
        onClick={onSend}
        disabled={disabled || !value}
        className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30"
      >
        <Send size={16} />
      </button>
    </div>
  );
};

export default ChatInput;
