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
        <div className="relative" style={{ width: `${W}px`, marginTop: "50px" }}>
          {/* Unified body shape with integrated eye bumps via SVG */}
          <svg
            className="absolute top-0 left-0 pointer-events-none"
            width={W}
            height={780}
            viewBox={`0 0 ${W} 780`}
            style={{ top: "-60px" }}
          >
            <defs>
              <clipPath id="frogBodyClip">
                {/* Unified path with large eye socket bumps that fully enclose the eyes */}
                <path d={`
                  M 0 130
                  L 0 740
                  Q 0 780, 40 780
                  L 480 780
                  Q 520 780, 520 740
                  L 520 130
                  L 520 110
                  C 520 30, 480 0, 440 0
                  L 420 0
                  C 395 0, 380 15, 380 40
                  L 380 60
                  C 380 95, 355 110, 320 110
                  L 200 110
                  C 165 110, 140 95, 140 60
                  L 140 40
                  C 140 15, 125 0, 100 0
                  L 80 0
                  C 40 0, 0 30, 0 110
                  Z
                `} />
              </clipPath>
              <filter id="feltNoise">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="5" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
                <feBlend in="SourceGraphic" mode="overlay" />
              </filter>
            </defs>
            {/* Main body fill */}
            <g clipPath="url(#frogBodyClip)">
              <rect x="0" y="0" width={W} height="780" fill="hsl(120, 16%, 44%)" />
              {/* Gradient highlights */}
              <ellipse cx="70" cy="50" rx="80" ry="60" fill="hsl(120, 16%, 50%)" opacity="0.4" />
              <ellipse cx="450" cy="50" rx="80" ry="60" fill="hsl(120, 16%, 50%)" opacity="0.4" />
              <ellipse cx="364" cy="600" rx="140" ry="100" fill="hsl(120, 14%, 36%)" opacity="0.4" />
              {/* Felt texture overlay */}
              <rect x="0" y="0" width={W} height="780" filter="url(#feltNoise)" opacity="0.12" />
            </g>
            {/* Subtle outline */}
            <path
              d={`
                M 0 130
                L 0 740
                Q 0 780, 40 780
                L 480 780
                Q 520 780, 520 740
                L 520 130
                L 520 110
                C 520 30, 480 0, 440 0
                L 420 0
                C 395 0, 380 15, 380 40
                L 380 60
                C 380 95, 355 110, 320 110
                L 200 110
                C 165 110, 140 95, 140 60
                L 140 40
                C 140 15, 125 0, 100 0
                L 80 0
                C 40 0, 0 30, 0 110
                Z
              `}
              fill="none"
              stroke="hsla(120, 15%, 30%, 0.5)"
              strokeWidth="1"
            />
          </svg>

          {/* Left eye - centered in left bump */}
          <div
            className="absolute z-[11]"
            style={{ top: "-48px", left: "18px" }}
          >
            <div
              className="w-[84px] h-[84px] rounded-full"
              style={{
                background: "radial-gradient(circle at 38% 32%, hsl(0, 0%, 24%), hsl(0, 0%, 6%) 55%, hsl(0, 0%, 2%))",
                boxShadow: `
                  inset 0 -6px 20px hsla(0,0%,0%,0.6),
                  0 4px 16px hsla(0,0%,0%,0.5)
                `,
              }}
            >
              <div
                className="absolute top-[12px] left-[17px] w-[22px] h-[15px] rounded-full"
                style={{
                  background: "radial-gradient(ellipse, hsla(0,0%,100%,0.4), transparent)",
                  transform: "rotate(-20deg)",
                }}
              />
              <div
                className="absolute top-[14px] left-[40px] w-[7px] h-[5px] rounded-full"
                style={{ background: "hsla(0,0%,100%,0.15)" }}
              />
            </div>
          </div>

          {/* Right eye */}
          <div
            className="absolute z-[11]"
            style={{ top: "-48px", right: "18px" }}
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

          {/* Speaker grille - between eyes */}
          <div className="absolute top-[26px] right-[148px] z-[12] grid grid-cols-5 gap-[3px]">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-[3px] h-[3px] rounded-full"
                style={{ background: "hsl(120, 12%, 32%)" }}
              />
            ))}
          </div>

          {/* LED dots */}
          <div className="absolute top-[34px] left-1/2 -translate-x-1/2 flex gap-[6px] z-[12]">
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

          {/* Content area */}
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
