import React from "react";
import { useNavigate } from "react-router-dom";
import DeviceFrame from "@/components/craiture/DeviceFrame";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import Fireflies from "@/components/craiture/Fireflies";
import { motion } from "framer-motion";

const menuItems = [
  { label: "Chat", path: "/demo/single-chat", desc: "Beth + Frog", icon: "💬" },
  { label: "First Activation", path: "/demo/onboarding", desc: "Onboarding flow", icon: "✨" },
  { label: "Two Player", path: "/demo/two-player", desc: "2 humans · 2 Craitures", icon: "👥" },
  { label: "Four Player", path: "/demo/four-player", desc: "4 humans · 4 Craitures", icon: "🎮" },
  { label: "Settings", path: "/demo/settings", desc: "Device config", icon: "⚙️" },
];

const DemoMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DeviceFrame>
      <FrogCreature opacity={0.28} size={500} className="top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <Fireflies count={6} color="120, 40%, 45%" />
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <h1
            className="text-5xl font-extralight tracking-wide text-foreground mb-3"
            style={{ animation: "title-glow 4s ease-in-out infinite" }}
          >
            Craiture
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            Choose an experience
          </p>
        </motion.div>

        <div className="w-full max-w-[340px] space-y-2.5">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.08, ease: "easeOut" }}
              onClick={() => navigate(item.path)}
              className="w-full text-left px-5 py-3.5 rounded-2xl backdrop-blur-md border border-border/30 transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "hsla(230, 14%, 15%, 0.5)",
                boxShadow: "0 4px 20px hsla(0, 0%, 0%, 0.2)",
              }}
              whileHover={{
                boxShadow: "0 4px 25px hsla(120, 30%, 30%, 0.15), inset 0 0 20px hsla(120, 30%, 30%, 0.05)",
              }}
            >
              <div className="flex items-center gap-3.5">
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <div className="text-[15px] font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                    {item.label}
                  </div>
                  <div className="text-xs text-muted-foreground/70 mt-0.5">
                    {item.desc}
                  </div>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-creature-frog-glow opacity-40 group-hover:opacity-80 transition-opacity" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </DeviceFrame>
  );
};

export default DemoMenu;
