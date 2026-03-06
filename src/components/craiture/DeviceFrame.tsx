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
        {/* Device body */}
        <div
          className="relative rounded-[40px] overflow-visible"
          style={{
            width: "520px",
            background: `
              radial-gradient(ellipse at 30% 15%, hsl(120, 16%, 50%) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 85%, hsl(120, 14%, 36%) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, hsl(120, 16%, 44%) 0%, hsl(120, 18%, 40%) 100%)
            `,
            boxShadow: `
              inset 0 2px 0 hsla(120, 20%, 55%, 0.2),
              inset 0 -3px 0 hsla(120, 20%, 25%, 0.3),
              0 0 0 1px hsla(120, 15%, 30%, 0.5)
            `,
          }}
        >
          {/* Felt/fabric texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-[1] rounded-[40px]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
              backgroundSize: "100px 100px",
              opacity: 0.7,
              mixBlendMode: "overlay",
            }}
          />

          {/* Eyes - sitting IN the top corners of the body, partially protruding */}
          <div className="absolute top-[-28px] left-[36px] z-[10]">
            <div
              className="w-[80px] h-[80px] rounded-full"
              style={{
                background: "radial-gradient(circle at 40% 35%, hsl(0, 0%, 22%), hsl(0, 0%, 6%) 60%, hsl(0, 0%, 3%))",
                boxShadow: `
                  inset 0 -6px 20px hsla(0,0%,0%,0.6),
                  0 6px 20px hsla(0,0%,0%,0.5),
                  0 0 0 2px hsla(0,0%,0%,0.2)
                `,
              }}
            >
              <div
                className="absolute top-[12px] left-[18px] w-[22px] h-[16px] rounded-full"
                style={{
                  background: "radial-gradient(ellipse, hsla(0,0%,100%,0.35), transparent)",
                  transform: "rotate(-15deg)",
                }}
              />
              <div
                className="absolute top-[14px] left-[40px] w-[8px] h-[6px] rounded-full"
                style={{ background: "hsla(0,0%,100%,0.15)" }}
              />
            </div>
          </div>

          <div className="absolute top-[-28px] right-[36px] z-[10]">
            <div
              className="w-[80px] h-[80px] rounded-full"
              style={{
                background: "radial-gradient(circle at 60% 35%, hsl(0, 0%, 22%), hsl(0, 0%, 6%) 60%, hsl(0, 0%, 3%))",
                boxShadow: `
                  inset 0 -6px 20px hsla(0,0%,0%,0.6),
                  0 6px 20px hsla(0,0%,0%,0.5),
                  0 0 0 2px hsla(0,0%,0%,0.2)
                `,
              }}
            >
              <div
                className="absolute top-[12px] left-[20px] w-[22px] h-[16px] rounded-full"
                style={{
                  background: "radial-gradient(ellipse, hsla(0,0%,100%,0.35), transparent)",
                  transform: "rotate(-15deg)",
                }}
              />
              <div
                className="absolute top-[14px] left-[42px] w-[8px] h-[6px] rounded-full"
                style={{ background: "hsla(0,0%,100%,0.15)" }}
              />
            </div>
          </div>

          {/* LED dots - between the eyes */}
          <div className="absolute top-[10px] left-1/2 -translate-x-1/2 flex gap-[6px] z-[11]">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-[4px] h-[4px] rounded-full"
                style={{
                  background: "hsl(0, 0%, 75%)",
                  boxShadow: "0 0 4px hsla(0, 0%, 100%, 0.3)",
                }}
              />
            ))}
          </div>

          {/* Speaker grille - right side */}
          <div className="absolute top-[18px] right-[20px] z-[3] grid grid-cols-4 gap-[3px]">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="w-[3px] h-[3px] rounded-full"
                style={{ background: "hsl(120, 12%, 32%)" }}
              />
            ))}
          </div>

          {/* Screen area */}
          <div className="px-[18px] pt-[50px] pb-[10px] relative z-[2]">
            <div
              className="relative rounded-[16px] overflow-hidden device-screen"
              style={{
                width: "484px",
                height: "400px",
                background: "hsl(230, 18%, 4%)",
                boxShadow: `
                  inset 0 2px 15px hsla(0, 0%, 0%, 0.7),
                  inset 0 0 0 1.5px hsla(0, 0%, 0%, 0.5),
                  0 -1px 0 hsla(120, 20%, 55%, 0.1)
                `,
                animation: edgeGlow ? "edge-glow 3s ease-in-out infinite" : undefined,
              }}
            >
              {children}
            </div>
          </div>

          {/* Toolbar strip */}
          <div className="relative z-[2] flex items-center justify-between px-[24px] py-[5px]">
            <div className="flex items-center gap-[3px]">
              {[0,1,2].map(i => (
                <div key={i} className="w-[12px] h-[2px] rounded-full" style={{ background: "hsl(120, 10%, 30%)" }} />
              ))}
            </div>
            <div
              className="w-[30px] h-[18px] rounded-[4px]"
              style={{
                background: "linear-gradient(180deg, hsl(0, 0%, 14%) 0%, hsl(0, 0%, 7%) 100%)",
                boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.05), 0 1px 3px hsla(0,0%,0%,0.4), 0 0 0 0.5px hsla(0,0%,100%,0.03)",
              }}
            />
            <div className="w-[8px] h-[8px] rounded-full" style={{ background: "hsl(120, 10%, 30%)" }} />
          </div>

          {/* Keyboard */}
          <div className="relative z-[2] px-[14px] pb-[20px] pt-[4px]">
            <div className="space-y-[4px]">
              {keyboardRows.map((row, ri) => (
                <div key={ri} className="flex justify-center gap-[3px]">
                  {row.map((key) => (
                    <div
                      key={key}
                      className="flex items-center justify-center rounded-[4px] select-none"
                      style={{
                        width: "44px",
                        height: "30px",
                        background: "linear-gradient(180deg, hsl(0, 0%, 14%) 0%, hsl(0, 0%, 7%) 100%)",
                        boxShadow: `
                          0 2px 3px hsla(0,0%,0%,0.5),
                          0 0 0 0.5px hsla(0,0%,100%,0.04),
                          inset 0 1px 0 hsla(0,0%,100%,0.06)
                        `,
                        fontSize: "10px",
                        fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
                        fontWeight: 600,
                        color: "hsl(0, 0%, 50%)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {key}
                    </div>
                  ))}
                </div>
              ))}
              {/* Space bar row */}
              <div className="flex justify-center gap-[3px] pt-[1px]">
                <div
                  className="flex items-center justify-center rounded-[4px] select-none"
                  style={{
                    width: "44px",
                    height: "28px",
                    background: "linear-gradient(180deg, hsl(0, 0%, 14%) 0%, hsl(0, 0%, 7%) 100%)",
                    boxShadow: "0 2px 3px hsla(0,0%,0%,0.5), 0 0 0 0.5px hsla(0,0%,100%,0.04), inset 0 1px 0 hsla(0,0%,100%,0.06)",
                    fontSize: "9px",
                    fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
                    fontWeight: 600,
                    color: "hsl(0, 0%, 45%)",
                  }}
                >
                  alt
                </div>
                <div
                  className="flex items-center justify-center rounded-[4px] select-none"
                  style={{
                    width: "270px",
                    height: "28px",
                    background: "linear-gradient(180deg, hsl(0, 0%, 14%) 0%, hsl(0, 0%, 7%) 100%)",
                    boxShadow: "0 2px 3px hsla(0,0%,0%,0.5), 0 0 0 0.5px hsla(0,0%,100%,0.04), inset 0 1px 0 hsla(0,0%,100%,0.06)",
                    fontSize: "9px",
                    fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
                    color: "hsl(0, 0%, 35%)",
                  }}
                />
                <div
                  className="flex items-center justify-center rounded-[4px] select-none"
                  style={{
                    width: "44px",
                    height: "28px",
                    background: "linear-gradient(180deg, hsl(0, 0%, 14%) 0%, hsl(0, 0%, 7%) 100%)",
                    boxShadow: "0 2px 3px hsla(0,0%,0%,0.5), 0 0 0 0.5px hsla(0,0%,100%,0.04), inset 0 1px 0 hsla(0,0%,100%,0.06)",
                    fontSize: "9px",
                    fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
                    fontWeight: 600,
                    color: "hsl(0, 0%, 45%)",
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
