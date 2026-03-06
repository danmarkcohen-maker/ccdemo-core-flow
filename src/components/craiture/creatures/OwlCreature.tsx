import React from "react";

interface OwlCreatureProps {
  opacity?: number;
  speaking?: boolean;
  className?: string;
}

const OwlCreature: React.FC<OwlCreatureProps> = ({ opacity = 0.15, speaking = false, className = "" }) => {
  return (
    <div
      className={`absolute pointer-events-none select-none ${className}`}
      style={{
        opacity: speaking ? Math.min(opacity + 0.1, 0.35) : opacity,
        filter: "blur(2px)",
        animation: "creature-breathe 5s ease-in-out infinite",
        transition: "opacity 0.8s ease",
      }}
    >
      <svg width="300" height="360" viewBox="0 0 300 360" fill="none">
        {/* Body */}
        <ellipse cx="150" cy="240" rx="90" ry="110" fill="hsl(35, 35%, 30%)" />
        {/* Chest */}
        <ellipse cx="150" cy="260" rx="55" ry="70" fill="hsl(35, 30%, 35%)" />
        {/* Head */}
        <ellipse cx="150" cy="120" rx="80" ry="70" fill="hsl(35, 38%, 33%)" />
        {/* Ear tufts */}
        <polygon points="90,70 100,110 80,100" fill="hsl(35, 35%, 30%)" />
        <polygon points="210,70 200,110 220,100" fill="hsl(35, 35%, 30%)" />
        {/* Eyes */}
        <g style={{ animation: "creature-blink 10s ease-in-out infinite" }}>
          <circle cx="120" cy="115" r="25" fill="hsl(40, 50%, 50%)" />
          <circle cx="180" cy="115" r="25" fill="hsl(40, 50%, 50%)" />
          <circle cx="120" cy="115" r="12" fill="hsl(35, 20%, 12%)" />
          <circle cx="180" cy="115" r="12" fill="hsl(35, 20%, 12%)" />
          <circle cx="125" cy="110" r="5" fill="hsl(40, 40%, 60%)" opacity="0.5" />
          <circle cx="185" cy="110" r="5" fill="hsl(40, 40%, 60%)" opacity="0.5" />
        </g>
        {/* Beak */}
        <polygon points="150,135 140,150 160,150" fill="hsl(35, 45%, 45%)" />
        {/* Wings */}
        <ellipse cx="70" cy="230" rx="35" ry="70" fill="hsl(35, 30%, 27%)" transform="rotate(10, 70, 230)" />
        <ellipse cx="230" cy="230" rx="35" ry="70" fill="hsl(35, 30%, 27%)" transform="rotate(-10, 230, 230)" />
      </svg>
    </div>
  );
};

export default OwlCreature;
