import React from "react";

interface DeviceFrameProps {
  children: React.ReactNode;
  edgeGlow?: boolean;
  creatureColor?: string;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({ children, edgeGlow, creatureColor = "120, 35%, 30%" }) => {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "hsl(220, 15%, 6%)" }}>
      {/* Ambient glow behind device */}
      <div
        className="absolute rounded-full blur-[100px] w-[600px] h-[600px]"
        style={{
          background: `radial-gradient(circle, hsla(${creatureColor}, 0.12) 0%, transparent 70%)`,
          animation: "ambient-glow 6s ease-in-out infinite",
        }}
      />

      {/* Full device body — frog shaped */}
      <div className="relative" style={{ filter: "drop-shadow(0 30px 60px hsla(0,0%,0%,0.5))" }}>
        {/* Frog eyes — protruding above body */}
        <div className="absolute -top-[52px] left-1/2 -translate-x-1/2 flex gap-[180px] z-20">
          {/* Left eye */}
          <div className="relative">
            <div
              className="w-[80px] h-[80px] rounded-full"
              style={{
                background: "radial-gradient(circle at 40% 35%, hsl(120, 18%, 52%), hsl(120, 20%, 34%), hsl(120, 22%, 28%))",
                boxShadow: "inset 0 -4px 12px hsla(0,0%,0%,0.3), 0 4px 12px hsla(0,0%,0%,0.4)",
              }}
            />
            {/* Pupil */}
            <div
              className="absolute top-[18px] left-[18px] w-[44px] h-[44px] rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 30%, hsl(0, 0%, 18%), hsl(0, 0%, 5%))",
                boxShadow: "inset 0 2px 8px hsla(0,0%,0%,0.6), 0 0 0 3px hsla(120, 25%, 40%, 0.3)",
                animation: "creature-blink 8s ease-in-out infinite",
              }}
            />
            {/* Eye shine */}
            <div className="absolute top-[22px] left-[24px] w-[12px] h-[12px] rounded-full bg-white/30" />
          </div>
          {/* Right eye */}
          <div className="relative">
            <div
              className="w-[80px] h-[80px] rounded-full"
              style={{
                background: "radial-gradient(circle at 60% 35%, hsl(120, 18%, 52%), hsl(120, 20%, 34%), hsl(120, 22%, 28%))",
                boxShadow: "inset 0 -4px 12px hsla(0,0%,0%,0.3), 0 4px 12px hsla(0,0%,0%,0.4)",
              }}
            />
            <div
              className="absolute top-[18px] left-[18px] w-[44px] h-[44px] rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 30%, hsl(0, 0%, 18%), hsl(0, 0%, 5%))",
                boxShadow: "inset 0 2px 8px hsla(0,0%,0%,0.6), 0 0 0 3px hsla(120, 25%, 40%, 0.3)",
                animation: "creature-blink 8s ease-in-out 0.15s infinite",
              }}
            />
            <div className="absolute top-[22px] left-[24px] w-[12px] h-[12px] rounded-full bg-white/30" />
          </div>
        </div>

        {/* LED dots between eyes */}
        <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-[6px] h-[6px] rounded-full"
              style={{
                background: "hsl(120, 50%, 65%)",
                boxShadow: "0 0 6px hsla(120, 50%, 60%, 0.6)",
                animation: `pulse-soft 2s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Device body */}
        <div
          className="relative rounded-[36px] p-[18px]"
          style={{
            width: "520px",
            background: `
              radial-gradient(ellipse at 30% 20%, hsl(120, 18%, 48%) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, hsl(120, 15%, 38%) 0%, transparent 50%),
              hsl(120, 18%, 42%)
            `,
            boxShadow: `
              inset 0 2px 0 hsla(120, 20%, 55%, 0.3),
              inset 0 -3px 0 hsla(120, 20%, 25%, 0.4),
              0 0 0 1px hsla(120, 15%, 30%, 0.5)
            `,
          }}
        >
          {/* Felt/fabric texture overlay */}
          <div
            className="absolute inset-0 rounded-[36px] pointer-events-none z-[1]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px",
              opacity: 0.6,
              mixBlendMode: "overlay",
            }}
          />

          {/* Speaker grille below eyes */}
          <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 z-[2]">
            <div
              className="w-[40px] h-[8px] rounded-full"
              style={{
                background: "hsl(120, 15%, 30%)",
                boxShadow: "inset 0 1px 3px hsla(0,0%,0%,0.4)",
              }}
            />
          </div>

          {/* Screen recessed area */}
          <div
            className="relative rounded-[22px] overflow-hidden z-[2]"
            style={{
              width: "484px",
              height: "484px",
              background: "hsl(230, 18%, 6%)",
              boxShadow: `
                inset 0 2px 15px hsla(0, 0%, 0%, 0.6),
                inset 0 0 0 1px hsla(0, 0%, 0%, 0.4),
                0 -1px 0 hsla(120, 20%, 55%, 0.15)
              `,
              animation: edgeGlow ? "edge-glow 3s ease-in-out infinite" : undefined,
            }}
          >
            {children}
          </div>

          {/* Bottom area — simplified keyboard hint / nav area */}
          <div className="flex items-center justify-center gap-4 pt-3 pb-1 z-[2] relative">
            <div
              className="w-[60px] h-[5px] rounded-full"
              style={{
                background: "hsla(120, 15%, 30%, 0.6)",
                boxShadow: "inset 0 1px 2px hsla(0,0%,0%,0.3)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceFrame;
