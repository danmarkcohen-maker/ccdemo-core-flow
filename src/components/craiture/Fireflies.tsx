import React from "react";

interface FirefliesProps {
  count?: number;
  color?: string;
}

const Fireflies: React.FC<FirefliesProps> = ({ count = 5, color = "120, 40%, 50%" }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${15 + Math.random() * 70}%`,
    top: `${10 + Math.random() * 70}%`,
    delay: `${Math.random() * 6}s`,
    duration: `${4 + Math.random() * 4}s`,
    size: 2 + Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: `hsla(${color}, 0.8)`,
            boxShadow: `0 0 ${p.size * 3}px hsla(${color}, 0.4)`,
            animation: `firefly ${p.duration} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
};

export default Fireflies;
