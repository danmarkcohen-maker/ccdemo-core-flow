import React from "react";

interface ThinkingDotsProps {
  creatureType?: string;
}

const ThinkingDots: React.FC<ThinkingDotsProps> = () => {
  return (
    <div className="flex justify-start mb-3" style={{ animation: "message-appear 0.25s ease-out" }}>
      <div className="bg-secondary px-5 py-3 rounded-2xl flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-muted-foreground"
            style={{
              animation: `thinking-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ThinkingDots;
