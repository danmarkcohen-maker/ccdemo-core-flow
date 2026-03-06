import React from "react";

interface DeviceFrameProps {
  children: React.ReactNode;
  edgeGlow?: boolean;
  creatureColor?: string;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({ children, edgeGlow, creatureColor = "120, 35%, 30%" }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[hsl(230,20%,3%)]">
      {/* Ambient device glow */}
      <div
        className="absolute rounded-full blur-[80px] w-[500px] h-[500px]"
        style={{
          background: `radial-gradient(circle, hsla(${creatureColor}, 0.15) 0%, transparent 70%)`,
          animation: "ambient-glow 6s ease-in-out infinite",
        }}
      />
      
      {/* Device bezel */}
      <div
        className="relative p-[6px] rounded-[28px]"
        style={{
          background: "linear-gradient(145deg, hsl(230, 15%, 16%), hsl(230, 18%, 8%))",
          boxShadow: `
            0 25px 60px -15px hsla(0, 0%, 0%, 0.6),
            0 0 0 1px hsla(0, 0%, 100%, 0.04),
            inset 0 1px 0 hsla(0, 0%, 100%, 0.06)
          `,
        }}
      >
        {/* Screen */}
        <div
          className="relative w-[720px] h-[720px] overflow-hidden rounded-[22px] bg-background"
          style={{
            animation: edgeGlow ? "edge-glow 3s ease-in-out infinite" : undefined,
            boxShadow: "inset 0 0 30px hsla(0, 0%, 0%, 0.3)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default DeviceFrame;
