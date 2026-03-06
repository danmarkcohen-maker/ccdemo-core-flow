import React, { useState } from "react";
import DeviceFrame from "@/components/craiture/DeviceFrame";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import BackButton from "@/components/craiture/BackButton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

const fontStyle = { fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" };

const Settings: React.FC = () => {
  const [volume, setVolume] = useState([65]);
  const [brightness, setBrightness] = useState([80]);
  const [rememberInterests, setRememberInterests] = useState(true);
  const [personality, setPersonality] = useState("balanced");

  return (
    <DeviceFrame>
      <BackButton />
      <FrogCreature opacity={0.12} size={380} className="top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-center py-3">
          <span className="text-[18px] text-foreground/80 font-semibold" style={fontStyle}>Settings</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <label className="text-[14px] text-muted-foreground mb-3 block font-semibold" style={fontStyle}>Volume</label>
            <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="w-full" />
            <div className="text-[13px] text-muted-foreground/60 mt-1.5 text-right">{volume[0]}%</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <label className="text-[14px] text-muted-foreground mb-3 block font-semibold" style={fontStyle}>Brightness</label>
            <Slider value={brightness} onValueChange={setBrightness} max={100} step={1} className="w-full" />
            <div className="text-[13px] text-muted-foreground/60 mt-1.5 text-right">{brightness[0]}%</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <label className="text-[14px] text-muted-foreground mb-3 block font-semibold" style={fontStyle}>Personality</label>
            <div className="grid grid-cols-3 gap-2.5">
              {["Calm", "Balanced", "Playful"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPersonality(p.toLowerCase())}
                  className={`px-3 py-3 rounded-full text-[15px] font-medium transition-all duration-200 active:scale-95 ${
                    personality === p.toLowerCase()
                      ? "bg-bubble-frog border border-creature-frog-glow/40 text-foreground"
                      : "bg-secondary/50 border border-white/[0.06] text-muted-foreground hover:bg-accent"
                  }`}
                  style={{ ...fontStyle, ...(personality === p.toLowerCase() ? { boxShadow: "0 3px 15px hsla(120, 30%, 25%, 0.25)" } : {}) }}
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
            <label className="text-[14px] text-muted-foreground block font-semibold" style={fontStyle}>Memory</label>
            <div className="flex items-center justify-between py-1">
              <span className="text-[16px] text-foreground/75" style={fontStyle}>Remember interests</span>
              <Switch checked={rememberInterests} onCheckedChange={setRememberInterests} />
            </div>
            <button
              className="w-full text-center px-4 py-3.5 rounded-full bg-secondary/40 border border-white/[0.06] text-[16px] text-destructive/70 hover:bg-destructive/10 transition-all duration-200 active:scale-95"
              style={fontStyle}
            >
              Clear conversation history
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <label className="text-[14px] text-muted-foreground mb-3 block font-semibold" style={fontStyle}>Parent Companion App</label>
            <button
              className="w-full px-4 py-3.5 rounded-full bg-creature-frog/30 border border-creature-frog-glow/20 text-[16px] text-foreground/70 hover:bg-creature-frog/40 transition-all duration-200 active:scale-95"
              style={fontStyle}
            >
              Pair Device →
            </button>
          </motion.div>
        </div>
      </div>
    </DeviceFrame>
  );
};

export default Settings;
