import React from "react";
import { useNavigate } from "react-router-dom";
import DeviceFrame from "@/components/craiture/DeviceFrame";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import Fireflies from "@/components/craiture/Fireflies";
import { motion } from "framer-motion";

const menuItems = [
  { label: "Chat", path: "/demo/single-chat", desc: "Beth + Frog", icon: "💬" },
  { label: "First Activation", path: "/demo/onboarding", desc: "Onboarding", icon: "✨" },
  { label: "Two Player", path: "/demo/two-player", desc: "2 humans · 2 Craitures", icon: "👥" },
  { label: "Four Player", path: "/demo/four-player", desc: "4 humans · 4 Craitures", icon: "🎮" },
  { label: "Settings", path: "/demo/settings", desc: "Device config", icon: "⚙️" },
];

const DemoMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DeviceFrame>
      <FrogCreature opacity={0.3} size={420} className="top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <Fireflies count={6} color="120, 40%, 45%" />
      
      <div className="relative z-10 flex flex-col items-center justify-between h-full py-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center pt-2"
        >
          <h1
            className="text-[42px] font-bold tracking-tight text-foreground"
            style={{
              animation: "title-glow 4s ease-in-out infinite",
              fontFamily: "'SF Pro Rounded', 'SF Pro Display', -apple-system, sans-serif",
            }}
          >
            Craiture
          </h1>
          <p className="text-lg text-muted-foreground mt-1" style={{ fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" }}>
            Choose an experience
          </p>
        </motion.div>

        <div className="w-full space-y-3 flex-1 flex flex-col justify-center max-w-full">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.07, ease: "easeOut" }}
              onClick={() => navigate(item.path)}
              className="w-full text-left rounded-[20px] backdrop-blur-lg border border-white/[0.08] transition-all duration-300 group active:scale-[0.97]"
              style={{
                padding: "18px 22px",
                background: "hsla(120, 15%, 25%, 0.25)",
                boxShadow: "0 4px 24px hsla(0, 0%, 0%, 0.2), inset 0 1px 0 hsla(120, 30%, 50%, 0.08)",
              }}
              whileHover={{
                background: "hsla(120, 18%, 28%, 0.35)",
                boxShadow: "0 6px 30px hsla(120, 30%, 25%, 0.2), inset 0 1px 0 hsla(120, 30%, 50%, 0.12)",
              }}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[20px] font-semibold text-foreground/95 group-hover:text-foreground transition-colors" style={{ fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" }}>
                    {item.label}
                  </div>
                  <div className="text-[14px] text-muted-foreground/70 mt-0.5">
                    {item.desc}
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-creature-frog-glow opacity-50 group-hover:opacity-90 transition-opacity" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </DeviceFrame>
  );
};

export default DemoMenu;
