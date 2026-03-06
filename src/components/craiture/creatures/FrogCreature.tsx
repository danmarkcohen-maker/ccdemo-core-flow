import React from "react";

interface FrogCreatureProps {
  opacity?: number;
  speaking?: boolean;
  className?: string;
}

const FrogCreature: React.FC<FrogCreatureProps> = ({ opacity = 0.15, speaking = false, className = "" }) => {
  return (
    <div
      className={`absolute pointer-events-none select-none ${className}`}
      style={{
        opacity: speaking ? Math.min(opacity + 0.1, 0.35) : opacity,
        filter: "blur(2px)",
        animation: "creature-breathe 4s ease-in-out infinite",
        transition: "opacity 0.8s ease",
      }}
    >
      <svg width="320" height="360" viewBox="0 0 320 360" fill="none">
        {/* Body */}
        <ellipse cx="160" cy="220" rx="120" ry="100" fill="hsl(120, 30%, 28%)" />
        {/* Head */}
        <ellipse cx="160" cy="140" rx="100" ry="80" fill="hsl(120, 32%, 32%)" />
        {/* Eyes */}
        <g style={{ animation: "creature-blink 8s ease-in-out infinite" }}>
          <circle cx="120" cy="115" r="22" fill="hsl(120, 25%, 40%)" />
          <circle cx="200" cy="115" r="22" fill="hsl(120, 25%, 40%)" />
          <circle cx="120" cy="112" r="10" fill="hsl(120, 15%, 15%)" />
          <circle cx="200" cy="112" r="10" fill="hsl(120, 15%, 15%)" />
          <circle cx="124" cy="108" r="4" fill="hsl(120, 20%, 50%)" opacity="0.6" />
          <circle cx="204" cy="108" r="4" fill="hsl(120, 20%, 50%)" opacity="0.6" />
        </g>
        {/* Mouth */}
        <path d="M 120 160 Q 160 180 200 160" stroke="hsl(120, 20%, 22%)" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Front legs */}
        <ellipse cx="80" cy="280" rx="30" ry="18" fill="hsl(120, 28%, 26%)" />
        <ellipse cx="240" cy="280" rx="30" ry="18" fill="hsl(120, 28%, 26%)" />
        {/* Back legs */}
        <ellipse cx="60" cy="300" rx="35" ry="22" fill="hsl(120, 26%, 24%)" transform="rotate(-15, 60, 300)" />
        <ellipse cx="260" cy="300" rx="35" ry="22" fill="hsl(120, 26%, 24%)" transform="rotate(15, 260, 300)" />
      </svg>
    </div>
  );
};

export default FrogCreature;
