import React from "react";

interface FoxCreatureProps {
  opacity?: number;
  speaking?: boolean;
  className?: string;
}

const FoxCreature: React.FC<FoxCreatureProps> = ({ opacity = 0.15, speaking = false, className = "" }) => {
  return (
    <div
      className={`absolute pointer-events-none select-none ${className}`}
      style={{
        opacity: speaking ? Math.min(opacity + 0.12, 0.4) : opacity,
        filter: "blur(0.5px)",
        animation: "creature-breathe 4.5s ease-in-out infinite",
        transition: "opacity 0.8s ease",
      }}
    >
      <svg width="300" height="360" viewBox="0 0 300 360" fill="none">
        {/* Body */}
        <ellipse cx="150" cy="250" rx="85" ry="100" fill="hsl(20, 45%, 32%)" />
        {/* Head */}
        <ellipse cx="150" cy="130" rx="75" ry="65" fill="hsl(20, 50%, 36%)" />
        {/* Ears */}
        <polygon points="95,80 80,30 115,75" fill="hsl(20, 48%, 34%)" />
        <polygon points="205,80 220,30 185,75" fill="hsl(20, 48%, 34%)" />
        <polygon points="100,78 90,45 112,73" fill="hsl(20, 35%, 28%)" />
        <polygon points="200,78 210,45 188,73" fill="hsl(20, 35%, 28%)" />
        {/* Eyes */}
        <g style={{ animation: "creature-blink 9s ease-in-out infinite" }}>
          <ellipse cx="120" cy="125" rx="15" ry="18" fill="hsl(35, 60%, 50%)" />
          <ellipse cx="180" cy="125" rx="15" ry="18" fill="hsl(35, 60%, 50%)" />
          <ellipse cx="120" cy="125" rx="7" ry="12" fill="hsl(20, 15%, 12%)" />
          <ellipse cx="180" cy="125" rx="7" ry="12" fill="hsl(20, 15%, 12%)" />
        </g>
        {/* Nose */}
        <ellipse cx="150" cy="150" rx="10" ry="7" fill="hsl(20, 20%, 18%)" />
        {/* Snout */}
        <ellipse cx="150" cy="145" rx="30" ry="20" fill="hsl(30, 40%, 40%)" />
        {/* Tail */}
        <path d="M 230 260 Q 280 200 260 280 Q 250 310 220 300" fill="hsl(20, 48%, 34%)" />
        <path d="M 255 270 Q 265 250 258 285" fill="hsl(30, 35%, 45%)" />
      </svg>
    </div>
  );
};

export default FoxCreature;
