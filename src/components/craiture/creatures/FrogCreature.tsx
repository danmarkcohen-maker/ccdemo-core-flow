import React from "react";

interface FrogCreatureProps {
  opacity?: number;
  speaking?: boolean;
  className?: string;
  size?: number;
}

const FrogCreature: React.FC<FrogCreatureProps> = ({ opacity = 0.25, speaking = false, className = "", size = 450 }) => {
  const scale = size / 360;
  return (
    <div
      className={`absolute pointer-events-none select-none ${className}`}
      style={{
        opacity: speaking ? Math.min(opacity + 0.12, 0.45) : opacity,
        filter: "blur(0.5px)",
        animation: "creature-breathe 4s ease-in-out infinite",
        transition: "opacity 1s ease",
      }}
    >
      {/* Ambient glow behind creature */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at 50% 40%, hsla(120, 35%, 35%, 0.3) 0%, transparent 60%)",
          transform: `scale(${scale * 1.3})`,
          filter: "blur(30px)",
        }}
      />
      <svg width={320 * scale} height={360 * scale} viewBox="0 0 320 360" fill="none" style={{ position: "relative" }}>
        {/* Body */}
        <ellipse cx="160" cy="220" rx="120" ry="100" fill="hsl(120, 32%, 26%)" />
        {/* Belly */}
        <ellipse cx="160" cy="240" rx="75" ry="65" fill="hsl(120, 28%, 30%)" opacity="0.6" />
        {/* Head */}
        <ellipse cx="160" cy="140" rx="105" ry="85" fill="hsl(120, 34%, 30%)" />
        {/* Eye bumps */}
        <circle cx="115" cy="100" r="32" fill="hsl(120, 30%, 28%)" />
        <circle cx="205" cy="100" r="32" fill="hsl(120, 30%, 28%)" />
        {/* Eyes */}
        <g style={{ animation: "creature-blink 8s ease-in-out infinite" }}>
          <circle cx="115" cy="98" r="24" fill="hsl(80, 40%, 50%)" />
          <circle cx="205" cy="98" r="24" fill="hsl(80, 40%, 50%)" />
          <circle cx="115" cy="96" r="12" fill="hsl(120, 20%, 10%)" />
          <circle cx="205" cy="96" r="12" fill="hsl(120, 20%, 10%)" />
          <circle cx="120" cy="92" r="5" fill="hsl(80, 40%, 65%)" opacity="0.7" />
          <circle cx="210" cy="92" r="5" fill="hsl(80, 40%, 65%)" opacity="0.7" />
        </g>
        {/* Smile */}
        <path d="M 115 160 Q 160 185 205 160" stroke="hsl(120, 22%, 20%)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* Cheek spots */}
        <circle cx="95" cy="150" r="12" fill="hsl(120, 25%, 32%)" opacity="0.5" />
        <circle cx="225" cy="150" r="12" fill="hsl(120, 25%, 32%)" opacity="0.5" />
        {/* Front legs */}
        <ellipse cx="75" cy="285" rx="32" ry="18" fill="hsl(120, 30%, 24%)" />
        <ellipse cx="245" cy="285" rx="32" ry="18" fill="hsl(120, 30%, 24%)" />
        {/* Toes */}
        <circle cx="55" cy="282" r="8" fill="hsl(120, 28%, 22%)" />
        <circle cx="95" cy="282" r="8" fill="hsl(120, 28%, 22%)" />
        <circle cx="225" cy="282" r="8" fill="hsl(120, 28%, 22%)" />
        <circle cx="265" cy="282" r="8" fill="hsl(120, 28%, 22%)" />
        {/* Back legs */}
        <ellipse cx="55" cy="305" rx="38" ry="24" fill="hsl(120, 28%, 22%)" transform="rotate(-15, 55, 305)" />
        <ellipse cx="265" cy="305" rx="38" ry="24" fill="hsl(120, 28%, 22%)" transform="rotate(15, 265, 305)" />
      </svg>
    </div>
  );
};

export default FrogCreature;
