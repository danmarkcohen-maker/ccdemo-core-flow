import React from "react";

interface DeviceFrameProps {
  children: React.ReactNode;
  edgeGlow?: boolean;
  creatureColor?: string;
}

const keyboardRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "⌫"],
  ["↑", "Z", "X", "C", "V", "B", "N", "M", ".", "↵"],
];

const DeviceFrame: React.FC<DeviceFrameProps> = ({ children, edgeGlow, creatureColor = "120, 35%, 30%" }) => {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "hsl(220, 15%, 6%)" }}>
      {/* Ambient glow */}
      <div
        className="absolute rounded-full blur-[100px] w-[600px] h-[600px]"
        style={{
          background: `radial-gradient(circle, hsla(${creatureColor}, 0.12) 0%, transparent 70%)`,
          animation: "ambient-glow 6s ease-in-out infinite",
        }}
      />

      <div className="relative" style={{ filter: "drop-shadow(0 30px 60px hsla(0,0%,0%,0.5))" }}>
        {/* Frog eyes */}
        <div className="absolute -top-[48px] left-1/2 -translate-x-1/2 flex gap-[170px] z-20">
          {[false, true].map((isRight, idx) => (
            <div key={idx} className="relative">
              <div
                className="w-[76px] h-[76px] rounded-full"
                style={{
                  background: `radial-gradient(circle at ${isRight ? "60%" : "40%"} 35%, hsl(120, 18%, 52%), hsl(120, 20%, 34%), hsl(120, 22%, 28%))`,
                  boxShadow: "inset 0 -4px 12px hsla(0,0%,0%,0.3), 0 4px 12px hsla(0,0%,0%,0.4)",
                }}
              />
              <div
                className="absolute top-[16px] left-[16px] w-[44px] h-[44px] rounded-full"
                style={{
                  background: "radial-gradient(circle at 35% 30%, hsl(0, 0%, 18%), hsl(0, 0%, 5%))",
                  boxShadow: "inset 0 2px 8px hsla(0,0%,0%,0.6), 0 0 0 3px hsla(120, 25%, 40%, 0.3)",
                  animation: `creature-blink 8s ease-in-out ${idx * 0.15}s infinite`,
                }}
              />
              <div className="absolute top-[20px] left-[22px] w-[11px] h-[11px] rounded-full bg-white/30" />
            </div>
          ))}
        </div>

        {/* LED dots */}
        <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-[5px] h-[5px] rounded-full"
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
          className="relative rounded-[36px] overflow-hidden"
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
          {/* Felt texture */}
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px",
              opacity: 0.6,
              mixBlendMode: "overlay",
            }}
          />

          {/* Speaker slot */}
          <div className="absolute top-[6px] left-1/2 -translate-x-1/2 z-[2]">
            <div
              className="w-[36px] h-[7px] rounded-full"
              style={{ background: "hsl(120, 15%, 30%)", boxShadow: "inset 0 1px 3px hsla(0,0%,0%,0.4)" }}
            />
          </div>

          {/* Screen area */}
          <div className="px-[18px] pt-[18px] pb-[10px] relative z-[2]">
            <div
              className="relative rounded-[20px] overflow-hidden device-screen"
              style={{
                width: "484px",
                height: "420px",
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
          </div>

          {/* Toolbar strip between screen and keyboard */}
          <div className="relative z-[2] flex items-center justify-between px-[24px] py-[6px]">
            {/* Menu button */}
            <div className="flex items-center gap-[3px]">
              <div className="w-[3px] h-[3px] rounded-full" style={{ background: "hsl(120, 12%, 28%)" }} />
              <div className="w-[3px] h-[3px] rounded-full" style={{ background: "hsl(120, 12%, 28%)" }} />
              <div className="w-[3px] h-[3px] rounded-full" style={{ background: "hsl(120, 12%, 28%)" }} />
            </div>
            {/* Trackpad nub */}
            <div
              className="w-[28px] h-[28px] rounded-[6px]"
              style={{
                background: "linear-gradient(145deg, hsl(0, 0%, 12%), hsl(0, 0%, 6%))",
                boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.05), 0 1px 3px hsla(0,0%,0%,0.4), 0 0 0 1px hsla(0,0%,100%,0.03)",
              }}
            />
            {/* Back button */}
            <div
              className="w-[14px] h-[14px] rounded-full"
              style={{
                background: "hsl(120, 12%, 28%)",
                boxShadow: "inset 0 1px 2px hsla(0,0%,0%,0.3)",
              }}
            />
          </div>

          {/* Keyboard */}
          <div className="relative z-[2] px-[14px] pb-[18px] pt-[4px]">
            <div className="space-y-[5px]">
              {keyboardRows.map((row, ri) => (
                <div key={ri} className="flex justify-center gap-[4px]">
                  {row.map((key) => (
                    <div
                      key={key}
                      className="flex items-center justify-center rounded-[5px] select-none"
                      style={{
                        width: "44px",
                        height: "32px",
                        background: "linear-gradient(180deg, hsl(0, 0%, 14%) 0%, hsl(0, 0%, 8%) 100%)",
                        boxShadow: `
                          0 2px 3px hsla(0,0%,0%,0.5),
                          0 0 0 0.5px hsla(0,0%,100%,0.04),
                          inset 0 1px 0 hsla(0,0%,100%,0.06)
                        `,
                        fontSize: "11px",
                        fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
                        fontWeight: 600,
                        color: "hsl(0, 0%, 55%)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {key}
                    </div>
                  ))}
                </div>
              ))}
              {/* Space bar row */}
              <div className="flex justify-center gap-[4px] pt-[2px]">
                <div
                  className="flex items-center justify-center rounded-[5px] select-none"
                  style={{
                    width: "44px",
                    height: "30px",
                    background: "linear-gradient(180deg, hsl(0, 0%, 14%) 0%, hsl(0, 0%, 8%) 100%)",
                    boxShadow: "0 2px 3px hsla(0,0%,0%,0.5), 0 0 0 0.5px hsla(0,0%,100%,0.04), inset 0 1px 0 hsla(0,0%,100%,0.06)",
                    fontSize: "10px",
                    fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
                    fontWeight: 600,
                    color: "hsl(0, 0%, 50%)",
                  }}
                >
                  alt
                </div>
                <div
                  className="flex items-center justify-center rounded-[5px] select-none"
                  style={{
                    width: "260px",
                    height: "30px",
                    background: "linear-gradient(180deg, hsl(0, 0%, 14%) 0%, hsl(0, 0%, 8%) 100%)",
                    boxShadow: "0 2px 3px hsla(0,0%,0%,0.5), 0 0 0 0.5px hsla(0,0%,100%,0.04), inset 0 1px 0 hsla(0,0%,100%,0.06)",
                    fontSize: "10px",
                    fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
                    color: "hsl(0, 0%, 40%)",
                  }}
                />
                <div
                  className="flex items-center justify-center rounded-[5px] select-none"
                  style={{
                    width: "44px",
                    height: "30px",
                    background: "linear-gradient(180deg, hsl(0, 0%, 14%) 0%, hsl(0, 0%, 8%) 100%)",
                    boxShadow: "0 2px 3px hsla(0,0%,0%,0.5), 0 0 0 0.5px hsla(0,0%,100%,0.04), inset 0 1px 0 hsla(0,0%,100%,0.06)",
                    fontSize: "10px",
                    fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
                    fontWeight: 600,
                    color: "hsl(0, 0%, 50%)",
                  }}
                >
                  sym
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceFrame;
