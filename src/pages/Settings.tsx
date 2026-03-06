import React, { useState } from "react";
import DeviceFrame from "@/components/craiture/DeviceFrame";
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
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-center py-4 border-b border-border/30">
          <div className="text-xs text-muted-foreground tracking-widest uppercase">
            Settings
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* Volume */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">Volume</label>
            <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="w-full" />
            <div className="text-xs text-muted-foreground mt-1 text-right">{volume[0]}%</div>
          </motion.div>

          {/* Brightness */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">Brightness</label>
            <Slider value={brightness} onValueChange={setBrightness} max={100} step={1} className="w-full" />
            <div className="text-xs text-muted-foreground mt-1 text-right">{brightness[0]}%</div>
          </motion.div>

          {/* Personality */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">
              Craiture Personality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Calm", "Balanced", "Playful"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPersonality(p.toLowerCase())}
                  className={`px-3 py-2 rounded-lg text-xs border transition-colors ${
                    personality === p.toLowerCase()
                      ? "bg-accent border-ring text-foreground"
                      : "bg-secondary/60 border-border/50 text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Memory Settings */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
            <label className="text-xs text-muted-foreground uppercase tracking-wider block">Memory</label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/80">Remember interests</span>
              <Switch checked={rememberInterests} onCheckedChange={setRememberInterests} />
            </div>
            <button className="w-full text-left px-4 py-3 rounded-lg bg-secondary/60 border border-border/50 text-sm text-destructive/80 hover:bg-destructive/10 transition-colors">
              Clear conversation history
            </button>
          </motion.div>

          {/* Parent App */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">
              Parent Companion App
            </label>
            <button className="w-full px-4 py-3 rounded-lg bg-secondary/60 border border-border/50 text-sm text-foreground/70 hover:bg-accent transition-colors">
              Pair Device →
            </button>
          </motion.div>
        </div>
      </div>
    </DeviceFrame>
  );
};

export default Settings;
