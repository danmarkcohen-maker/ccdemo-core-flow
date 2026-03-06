import React, { useState } from "react";
import DeviceFrame from "@/components/craiture/DeviceFrame";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import BackButton from "@/components/craiture/BackButton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

const Settings: React.FC = () => {
  const [volume, setVolume] = useState([65]);
  const [brightness, setBrightness] = useState([80]);
  const [rememberInterests, setRememberInterests] = useState(true);
  const [personality, setPersonality] = useState("balanced");

  return (
    <DeviceFrame>
      <BackButton />
      <FrogCreature opacity={0.1} size={400} className="top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/70 font-light">Settings</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-7">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <label className="text-xs text-muted-foreground mb-3 block font-medium">Volume</label>
            <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="w-full" />
            <div className="text-xs text-muted-foreground/60 mt-1.5 text-right">{volume[0]}%</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <label className="text-xs text-muted-foreground mb-3 block font-medium">Brightness</label>
            <Slider value={brightness} onValueChange={setBrightness} max={100} step={1} className="w-full" />
            <div className="text-xs text-muted-foreground/60 mt-1.5 text-right">{brightness[0]}%</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <label className="text-xs text-muted-foreground mb-3 block font-medium">Craiture Personality</label>
            <div className="grid grid-cols-3 gap-2">
              {["Calm", "Balanced", "Playful"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPersonality(p.toLowerCase())}
                  className={`px-3 py-2.5 rounded-2xl text-xs transition-all duration-200 ${
                    personality === p.toLowerCase()
                      ? "bg-bubble-frog border border-creature-frog-glow/40 text-foreground"
                      : "bg-secondary/50 border border-border/30 text-muted-foreground hover:bg-accent"
                  }`}
                  style={personality === p.toLowerCase() ? { boxShadow: "0 2px 12px hsla(120, 30%, 25%, 0.2)" } : {}}
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
            <label className="text-xs text-muted-foreground block font-medium">Memory</label>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-foreground/70">Remember interests</span>
              <Switch checked={rememberInterests} onCheckedChange={setRememberInterests} />
            </div>
            <button
              className="w-full text-left px-4 py-3 rounded-2xl bg-secondary/40 border border-border/20 text-sm text-destructive/70 hover:bg-destructive/10 transition-all duration-200"
            >
              Clear conversation history
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <label className="text-xs text-muted-foreground mb-3 block font-medium">Parent Companion App</label>
            <button
              className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/20 text-sm text-foreground/60 hover:bg-accent transition-all duration-200"
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
