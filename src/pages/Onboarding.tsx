import React, { useState, useEffect } from "react";
import DeviceFrame from "@/components/craiture/DeviceFrame";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import Fireflies from "@/components/craiture/Fireflies";
import BackButton from "@/components/craiture/BackButton";
import { motion, AnimatePresence } from "framer-motion";

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [creatureOpacity, setCreatureOpacity] = useState(0.0);
  const [screenOn, setScreenOn] = useState(false);

  useEffect(() => {
    // Boot sequence
    setTimeout(() => setScreenOn(true), 300);
    setTimeout(() => { setStep(1); setCreatureOpacity(0.12); }, 2000);
    setTimeout(() => { setStep(2); setCreatureOpacity(0.2); }, 4200);
    setTimeout(() => { setStep(3); setCreatureOpacity(0.28); }, 6400);
  }, []);

  const handleNameSubmit = () => {
    if (!name.trim()) return;
    setSubmittedName(name.trim());
    setStep(4);
    setCreatureOpacity(0.35);
    setTimeout(() => setStep(5), 2500);
    setTimeout(() => { setStep(6); setCreatureOpacity(0.38); }, 4500);
  };

  const topicColors = [
    "hsla(120, 35%, 30%, 0.4)",
    "hsla(35, 45%, 35%, 0.4)",
    "hsla(210, 35%, 35%, 0.4)",
    "hsla(280, 30%, 35%, 0.4)",
    "hsla(160, 35%, 30%, 0.4)",
    "hsla(20, 45%, 35%, 0.4)",
  ];

  return (
    <DeviceFrame>
      <BackButton />
      
      <div
        className="absolute inset-0 transition-all duration-[2000ms]"
        style={{
          opacity: screenOn ? 1 : 0,
          filter: screenOn ? "brightness(1)" : "brightness(0)",
        }}
      >
        <FrogCreature
          opacity={creatureOpacity}
          size={520}
          className="top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-[2500ms]"
        />
        <Fireflies count={4} color="120, 40%, 45%" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-14">
        <div className="space-y-8 text-center min-h-[240px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {step >= 1 && step < 4 && (
              <motion.p
                key="hello"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                className="text-2xl text-foreground/80 font-extralight tracking-wide"
              >
                Hello there.
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 2 && step < 4 && (
              <motion.p
                key="name"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                className="text-2xl font-extralight tracking-wide"
                style={{ color: "hsl(120, 40%, 50%)" }}
              >
                I'm Frog.
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 3 && step < 4 && (
              <motion.div
                key="ask-name"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="space-y-5 w-full max-w-[280px]"
              >
                <p className="text-xl text-foreground/60 font-extralight">
                  What should I call you?
                </p>
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                    placeholder="Your name..."
                    className="bg-secondary/60 backdrop-blur rounded-2xl px-5 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-border/30 focus:border-creature-frog-glow/60 transition-all duration-300 flex-1"
                    style={{ boxShadow: "inset 0 2px 8px hsla(0, 0%, 0%, 0.15)" }}
                    autoFocus
                  />
                  <button
                    onClick={handleNameSubmit}
                    disabled={!name.trim()}
                    className="w-12 h-12 rounded-2xl bg-bubble-frog text-foreground text-lg flex items-center justify-center hover:opacity-80 transition-all disabled:opacity-20"
                    style={{ boxShadow: "0 4px 15px hsla(120, 30%, 25%, 0.3)" }}
                  >
                    →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 4 && (
              <motion.p
                key="greet"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                className="text-2xl text-foreground/80 font-extralight tracking-wide"
              >
                Nice to meet you, {submittedName}. 🐸
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 5 && (
              <motion.p
                key="interests"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2 }}
                className="text-xl text-foreground/50 font-extralight"
              >
                What do you like to talk about?
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 6 && (
              <motion.div
                key="topics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-wrap gap-2.5 justify-center mt-2"
              >
                {["Science", "Art", "Games", "Music", "Nature", "Stories"].map((topic, i) => (
                  <motion.button
                    key={topic}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="px-5 py-2.5 rounded-2xl text-sm text-foreground/80 border border-border/30 hover:text-foreground hover:scale-105 active:scale-95 transition-all duration-200"
                    style={{
                      background: topicColors[i],
                      boxShadow: "0 2px 12px hsla(0, 0%, 0%, 0.2)",
                    }}
                  >
                    {topic}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DeviceFrame>
  );
};

export default Onboarding;
