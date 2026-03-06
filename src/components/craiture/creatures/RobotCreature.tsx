import React from "react";

interface RobotCreatureProps {
  opacity?: number;
  speaking?: boolean;
  className?: string;
}

const RobotCreature: React.FC<RobotCreatureProps> = ({ opacity = 0.15, speaking = false, className = "" }) => {
  return (
    <div
      className={`absolute pointer-events-none select-none ${className}`}
      style={{
        opacity: speaking ? Math.min(opacity + 0.12, 0.4) : opacity,
        filter: "blur(0.5px)",
        animation: "creature-breathe 3.5s ease-in-out infinite",
        transition: "opacity 0.8s ease",
      }}
    >
      <svg width="280" height="360" viewBox="0 0 280 360" fill="none">
        {/* Antenna */}
        <line x1="140" y1="40" x2="140" y2="80" stroke="hsl(210, 25%, 40%)" strokeWidth="4" />
        <circle cx="140" cy="35" r="8" fill="hsl(210, 40%, 55%)" style={{ animation: "pulse-soft 2s ease-in-out infinite" }} />
        {/* Head */}
        <rect x="80" y="80" width="120" height="90" rx="15" fill="hsl(210, 25%, 35%)" />
        {/* Eyes */}
        <g style={{ animation: "creature-blink 7s ease-in-out infinite" }}>
          <rect x="105" y="105" width="25" height="20" rx="5" fill="hsl(210, 40%, 55%)" />
          <rect x="150" y="105" width="25" height="20" rx="5" fill="hsl(210, 40%, 55%)" />
          <rect x="112" y="110" width="10" height="10" rx="2" fill="hsl(210, 20%, 15%)" />
          <rect x="157" y="110" width="10" height="10" rx="2" fill="hsl(210, 20%, 15%)" />
        </g>
        {/* Mouth */}
        <rect x="115" y="145" width="50" height="8" rx="4" fill="hsl(210, 20%, 28%)" />
        {/* Neck */}
        <rect x="125" y="170" width="30" height="20" rx="5" fill="hsl(210, 22%, 32%)" />
        {/* Body */}
        <rect x="70" y="190" width="140" height="120" rx="20" fill="hsl(210, 25%, 30%)" />
        {/* Chest panel */}
        <rect x="100" y="210" width="80" height="60" rx="10" fill="hsl(210, 20%, 25%)" />
        <circle cx="140" cy="240" r="15" fill="hsl(210, 35%, 40%)" opacity="0.6" />
        {/* Arms */}
        <rect x="40" y="200" width="25" height="80" rx="12" fill="hsl(210, 22%, 32%)" />
        <rect x="215" y="200" width="25" height="80" rx="12" fill="hsl(210, 22%, 32%)" />
      </svg>
    </div>
  );
};

export default RobotCreature;
