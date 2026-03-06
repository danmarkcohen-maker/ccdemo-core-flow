import React, { useState, useEffect } from "react";
import DeviceFrame from "@/components/craiture/DeviceFrame";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import BackButton from "@/components/craiture/BackButton";
import { motion, AnimatePresence } from "framer-motion";

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [creatureOpacity, setCreatureOpacity] = useState(0.05);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => { setStep(1); setCreatureOpacity(0.08); }, 1500));
    timers.push(setTimeout(() => { setStep(2); setCreatureOpacity(0.12); }, 3500));
    timers.push(setTimeout(() => { setStep(3); setCreatureOpacity(0.16); }, 5500));
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleNameSubmit = () => {
    if (!name.trim()) return;
    setSubmittedName(name.trim());
    setStep(4);
    setCreatureOpacity(0.2);
    setTimeout(() => setStep(5), 2500);
    setTimeout(() => setStep(6), 4500);
  };

  return (
    <DeviceFrame>
      <BackButton />
      <FrogCreature
        opacity={creatureOpacity}
        className="top-[20%] left-1/2 -translate-x-1/2 transition-opacity duration-[2000ms]"
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-12">
        <div className="space-y-6 text-center min-h-[200px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {step >= 1 && step < 4 && (
              <motion.p
                key="hello"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-xl text-foreground/80 font-light"
              >
                Hello there.
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 2 && step < 4 && (
              <motion.p
                key="name"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-xl text-creature-frog-glow font-light"
              >
                I'm Frog.
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 3 && step < 4 && (
              <motion.div
                key="ask-name"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-4"
              >
                <p className="text-lg text-foreground/70 font-light">
                  What should I call you?
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                    placeholder="Your name..."
                    className="bg-secondary rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-ring transition-colors flex-1"
                    autoFocus
                  />
                  <button
                    onClick={handleNameSubmit}
                    disabled={!name.trim()}
                    className="px-4 py-2.5 rounded-full bg-bubble-frog text-foreground text-sm hover:opacity-80 transition-opacity disabled:opacity-30"
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-xl text-foreground/80 font-light"
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
                transition={{ duration: 1 }}
                className="text-lg text-foreground/60 font-light"
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
                className="flex flex-wrap gap-2 justify-center mt-2"
              >
                {["Science", "Art", "Games", "Music", "Nature", "Stories"].map((topic) => (
                  <button
                    key={topic}
                    className="px-4 py-2 rounded-full bg-secondary text-sm text-foreground/70 hover:bg-accent hover:text-foreground border border-border/50 transition-colors"
                  >
                    {topic}
                  </button>
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
