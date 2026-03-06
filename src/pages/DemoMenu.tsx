import React from "react";
import { useNavigate } from "react-router-dom";
import DeviceFrame from "@/components/craiture/DeviceFrame";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import { motion } from "framer-motion";

const menuItems = [
  { label: "Single User Chat", path: "/demo/single-chat", desc: "Beth + Frog" },
  { label: "Onboarding Flow", path: "/demo/onboarding", desc: "First activation" },
  { label: "Two Player Chatroom", path: "/demo/two-player", desc: "2 humans · 2 Craitures" },
  { label: "Four Player Chatroom", path: "/demo/four-player", desc: "4 humans · 4 Craitures" },
  { label: "Settings", path: "/demo/settings", desc: "Device configuration" },
];

const DemoMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DeviceFrame>
      <FrogCreature opacity={0.08} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-light tracking-wider text-foreground mb-2">
            Craiture
          </h1>
          <p className="text-sm text-muted-foreground tracking-wide">
            Choose an experience
          </p>
        </motion.div>

        <div className="w-full max-w-sm space-y-3">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1, ease: "easeOut" }}
              onClick={() => navigate(item.path)}
              className="w-full text-left px-5 py-4 rounded-xl bg-secondary/60 hover:bg-accent border border-border/50 hover:border-border transition-all duration-200 group"
            >
              <div className="text-sm font-medium text-foreground group-hover:text-foreground/90">
                {item.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {item.desc}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </DeviceFrame>
  );
};

export default DemoMenu;
