import React from "react";

interface DeviceFrameProps {
  children: React.ReactNode;
  edgeGlow?: boolean;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({ children, edgeGlow }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[hsl(230,20%,5%)]">
      <div
        className="relative w-[720px] h-[720px] overflow-hidden rounded-2xl bg-background"
        style={{
          animation: edgeGlow ? "edge-glow 3s ease-in-out infinite" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default DeviceFrame;
