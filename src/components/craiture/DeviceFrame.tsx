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
  // Device dimensions
  const W = 520;
  const eyeR = 44; // eye radius
  const bodyR = 40; // body corner radius

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
        {/* 
          The body shape: a rectangle with two circular bumps at top-left and top-right corners.
          We use an SVG to define this organic frog-head silhouette.
        */}
        <div className="relative" style={{ width: `${W}px` }}>
          {/* SVG body shape with eye socket bumps */}
          <svg
            className="absolute top-0 left-0 w-full"
            viewBox={`0 0 ${W} 780`}
            fill="none"
            style={{ width: W, height: 780 }}
          >
            <defs>
              {/* The frog body path: bumps on top corners wrapping around eyes */}
              <clipPath id="frogBody">
                <path d={`
                  M ${bodyR} 70
                  L ${bodyR} ${bodyR}
                  Q 0 0, ${bodyR} 0
                  L ${eyeR + 8} 0
                  A ${eyeR} ${eyeR} 0 1 1 ${eyeR + 8} ${eyeR * 2}
                  L ${bodyR} ${eyeR * 2}
                  L ${bodyR} 70
                  
                  Z
                `} />
              </clipPath>
            </defs>
          </svg>

          {/* Body background with organic top using pseudo-elements */}
          {/* Main rectangular body */}
          <div
            className="absolute left-0 rounded-b-[40px] overflow-hidden"
            style={{
              top: "52px",
              width: `${W}px`,
              bottom: 0,
              background: `
                radial-gradient(ellipse at 30% 15%, hsl(120, 16%, 50%) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 85%, hsl(120, 14%, 36%) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 50%, hsl(120, 16%, 44%) 0%, hsl(120, 18%, 40%) 100%)
              `,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              boxShadow: `
                inset 0 -3px 0 hsla(120, 20%, 25%, 0.3),
                0 0 0 1px hsla(120, 15%, 30%, 0.5)
              `,
            }}
          >
            {/* Felt texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
                backgroundSize: "100px 100px",
                opacity: 0.7,
                mixBlendMode: "overlay" as const,
              }}
            />
          </div>

          {/* Left eye socket bump - extends above the body */}
          <div
            className="absolute z-[5]"
            style={{
              top: "-48px",
              left: 0,
              width: "140px",
              height: "120px",
            }}
          >
            {/* Green socket shell */}
            <div
              className="absolute inset-0"
              style={{
                borderRadius: "50px 50px 20px 40px",
                background: `
                  radial-gradient(ellipse at 40% 30%, hsl(120, 16%, 50%) 0%, transparent 70%),
                  hsl(120, 16%, 44%)
                `,
                boxShadow: `
                  inset 0 2px 0 hsla(120, 20%, 55%, 0.2),
                  0 0 0 1px hsla(120, 15%, 30%, 0.5)
                `,
              }}
            />
            {/* Felt texture on socket */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: "50px 50px 20px 40px",
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
                backgroundSize: "100px 100px",
                opacity: 0.7,
                mixBlendMode: "overlay" as const,
              }}
            />
            {/* The eye ball */}
            <div
              className="absolute z-[11]"
              style={{ top: "8px", left: "30px" }}
            >
              <div
                className="w-[80px] h-[80px] rounded-full"
                style={{
                  background: "radial-gradient(circle at 38% 32%, hsl(0, 0%, 24%), hsl(0, 0%, 6%) 55%, hsl(0, 0%, 2%))",
                  boxShadow: `
                    inset 0 -6px 20px hsla(0,0%,0%,0.6),
                    0 4px 16px hsla(0,0%,0%,0.5)
                  `,
                }}
              >
                <div
                  className="absolute top-[11px] left-[16px] w-[20px] h-[14px] rounded-full"
                  style={{
                    background: "radial-gradient(ellipse, hsla(0,0%,100%,0.4), transparent)",
                    transform: "rotate(-20deg)",
                  }}
                />
                <div
                  className="absolute top-[13px] left-[38px] w-[7px] h-[5px] rounded-full"
                  style={{ background: "hsla(0,0%,100%,0.15)" }}
                />
              </div>
            </div>
          </div>

          {/* Right eye socket bump */}
          <div
            className="absolute z-[5]"
            style={{
              top: "-48px",
              right: 0,
              width: "140px",
              height: "120px",
            }}
          >
            {/* Green socket shell */}
            <div
              className="absolute inset-0"
              style={{
                borderRadius: "50px 50px 40px 20px",
                background: `
                  radial-gradient(ellipse at 60% 30%, hsl(120, 16%, 50%) 0%, transparent 70%),
                  hsl(120, 16%, 44%)
                `,
                boxShadow: `
                  inset 0 2px 0 hsla(120, 20%, 55%, 0.2),
                  0 0 0 1px hsla(120, 15%, 30%, 0.5)
                `,
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: "50px 50px 40px 20px",
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
                backgroundSize: "100px 100px",
                opacity: 0.7,
                mixBlendMode: "overlay" as const,
              }}
            />
            {/* The eye ball */}
            <div
              className="absolute z-[11]"
              style={{ top: "8px", right: "30px" }}
            >
              <div
                className="w-[80px] h-[80px] rounded-full"
                style={{
                  background: "radial-gradient(circle at 62% 32%, hsl(0, 0%, 24%), hsl(0, 0%, 6%) 55%, hsl(0, 0%, 2%))",
                  boxShadow: `
                    inset 0 -6px 20px hsla(0,0%,0%,0.6),
                    0 4px 16px hsla(0,0%,0%,0.5)
                  `,
                }}
              >
                <div
                  className="absolute top-[11px] left-[18px] w-[20px] h-[14px] rounded-full"
                  style={{
                    background: "radial-gradient(ellipse, hsla(0,0%,100%,0.4), transparent)",
                    transform: "rotate(-20deg)",
                  }}
                />
                <div
                  className="absolute top-[13px] left-[40px] w-[7px] h-[5px] rounded-full"
                  style={{ background: "hsla(0,0%,100%,0.15)" }}
                />
              </div>
            </div>
          </div>

          {/* Speaker grille - top right area */}
          <div className="absolute top-[26px] right-[148px] z-[6] grid grid-cols-5 gap-[3px]">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-[3px] h-[3px] rounded-full"
                style={{ background: "hsl(120, 12%, 32%)" }}
              />
            ))}
          </div>

          {/* LED dots - center top between eyes */}
          <div className="absolute top-[34px] left-1/2 -translate-x-1/2 flex gap-[6px] z-[11]">
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

          {/* Content area - positioned below eye sockets */}
          <div className="relative z-[8]" style={{ paddingTop: "62px" }}>
            {/* Screen area */}
            <div className="px-[18px] pt-[8px] pb-[10px]">
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
            <div className="flex items-center justify-between px-[24px] py-[5px]">
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
            <div className="px-[14px] pb-[20px] pt-[4px]">
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
    </div>
  );
};

export default DeviceFrame;
