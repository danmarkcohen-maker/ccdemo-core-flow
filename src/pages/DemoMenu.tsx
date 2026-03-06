import React from "react";
import { useNavigate } from "react-router-dom";
import DeviceFrame from "@/components/craiture/DeviceFrame";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import Fireflies from "@/components/craiture/Fireflies";
import { motion } from "framer-motion";

const menuItems = [
  { label: "Chat", path: "/demo/single-chat", desc: "Beth + Frog", icon: "💬" },
  { label: "First Activation", path: "/demo/onboarding", desc: "Onboarding", icon: "✨" },
  { label: "Two Player", path: "/demo/two-player", desc: "2v2 Playdate", icon: "👥" },
  { label: "Four Player", path: "/demo/four-player", desc: "4v4 Playdate", icon: "🎮" },
  { label: "Settings", path: "/demo/settings", icon: "⚙️" },
];

const fontStyle = { fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" };

const DemoMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DeviceFrame>
      <FrogCreature opacity={0.22} size={380} className="top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <Fireflies count={5} color="120, 40%, 45%" />
      
      <div className="relative z-10 flex flex-col h-full py-4 px-4 device-scroll overflow-y-auto">
        {/* Status bar */}
        <div className="flex items-center justify-between px-2 pb-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-creature-frog-glow" />
            <span className="text-[12px] text-muted-foreground/60 font-medium" style={fontStyle}>Frog</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground/40" style={fontStyle}>3:42 PM</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-[3px] rounded-full bg-creature-frog-glow/60" style={{ height: `${6 + i * 2}px` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Menu items fill the screen */}
        <div className="flex-1 flex flex-col justify-center space-y-2.5">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: "easeOut" }}
              onClick={() => navigate(item.path)}
              className="w-full text-left rounded-[18px] backdrop-blur-lg border border-white/[0.06] transition-all duration-200 group active:scale-[0.97]"
              style={{
                padding: "16px 18px",
                background: "hsla(120, 15%, 25%, 0.2)",
                boxShadow: "0 3px 16px hsla(0, 0%, 0%, 0.15), inset 0 1px 0 hsla(120, 30%, 50%, 0.06)",
                ...fontStyle,
              }}
              whileHover={{
                background: "hsla(120, 18%, 28%, 0.3)",
              }}
            >
              <div className="flex items-center gap-3.5">
                <span className="text-[22px]">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[19px] font-semibold text-foreground/90 group-hover:text-foreground transition-colors">
                    {item.label}
                  </div>
                  {item.desc && (
                    <div className="text-[13px] text-muted-foreground/55 mt-0.5">
                      {item.desc}
                    </div>
                  )}
                </div>
                <div className="text-[16px] text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors">›</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </DeviceFrame>
  );
};

export default DemoMenu;
