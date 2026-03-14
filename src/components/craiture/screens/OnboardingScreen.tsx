import React, { useState, useEffect } from "react";
import FrogCreature from "@/components/craiture/creatures/FrogCreature";
import Fireflies from "@/components/craiture/Fireflies";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingScreenProps {
  onComplete: (name: string, age: number, topics?: string[]) => void;
}

const topicColors = [
  "hsla(120, 35%, 30%, 0.5)",
  "hsla(35, 45%, 35%, 0.5)",
  "hsla(210, 35%, 35%, 0.5)",
  "hsla(280, 30%, 35%, 0.5)",
  "hsla(160, 35%, 30%, 0.5)",
  "hsla(20, 45%, 35%, 0.5)",
];

const ageColors = [
  "hsla(120, 35%, 30%, 0.5)",
  "hsla(35, 45%, 35%, 0.5)",
  "hsla(210, 35%, 35%, 0.5)",
  "hsla(280, 30%, 35%, 0.5)",
  "hsla(160, 35%, 30%, 0.5)",
  "hsla(20, 45%, 35%, 0.5)",
  "hsla(340, 35%, 35%, 0.5)",
  "hsla(60, 35%, 30%, 0.5)",
  "hsla(190, 35%, 30%, 0.5)",
];

const fontStyle = { fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" };

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [creatureOpacity, setCreatureOpacity] = useState(0.0);
  const [screenOn, setScreenOn] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    setTimeout(() => setScreenOn(true), 300);
    setTimeout(() => { setStep(1); setCreatureOpacity(0.15); }, 2000);
    setTimeout(() => { setStep(2); setCreatureOpacity(0.25); }, 4200);
    setTimeout(() => { setStep(3); setCreatureOpacity(0.32); }, 6400);
  }, []);

  const handleNameSubmit = () => {
    if (!name.trim()) return;
    setSubmittedName(name.trim());
    setStep(4);
    setCreatureOpacity(0.38);
    // After greeting, ask for age
    setTimeout(() => { setStep(5); }, 2500);
    setTimeout(() => { setStep(6); setCreatureOpacity(0.42); }, 4500);
  };

  const handleAgeSelect = (age: number) => {
    setSelectedAge(age);
    // Transition to topics after selecting age
    setTimeout(() => { setStep(7); setCreatureOpacity(0.45); }, 800);
    setTimeout(() => { setStep(8); setCreatureOpacity(0.48); }, 2800);
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleTopicsDone = () => {
    if (!selectedAge) return;
    onComplete(submittedName, selectedAge, selectedTopics.length > 0 ? selectedTopics : undefined);
  };

  return (
    <>
      <div
        className="absolute inset-0 transition-all duration-[2000ms]"
        style={{
          opacity: screenOn ? 1 : 0,
          filter: screenOn ? "brightness(1)" : "brightness(0)",
        }}
      >
        <FrogCreature
          opacity={creatureOpacity}
          size={440}
          className="top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-[2500ms]"
        />
        <Fireflies count={4} color="120, 40%, 45%" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
        <div className="space-y-6 text-center min-h-[280px] flex flex-col items-center justify-center w-full">
          <AnimatePresence mode="wait">
            {step >= 1 && step < 4 && (
              <motion.p
                key="hello"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                className="text-[28px] text-foreground/85 font-light"
                style={fontStyle}
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
                className="text-[28px] font-medium"
                style={{ ...fontStyle, color: "hsl(120, 45%, 55%)" }}
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
                className="space-y-5 w-full"
              >
                <p className="text-[24px] text-foreground/65 font-light" style={fontStyle}>
                  What should I call you?
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                    placeholder="Your name..."
                    className="bg-secondary/60 backdrop-blur rounded-full px-6 py-4 text-[20px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-white/[0.08] focus:border-creature-frog-glow/60 transition-all duration-300 flex-1"
                    style={{ boxShadow: "inset 0 2px 8px hsla(0, 0%, 0%, 0.2)", ...fontStyle }}
                    autoFocus
                  />
                  <button
                    onClick={handleNameSubmit}
                    disabled={!name.trim()}
                    className="w-14 h-14 rounded-full bg-creature-frog text-foreground text-xl font-bold flex items-center justify-center hover:bg-creature-frog-glow transition-all disabled:opacity-20 active:scale-90"
                    style={{ boxShadow: "0 4px 15px hsla(120, 30%, 25%, 0.3)" }}
                  >
                    →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 4 && step < 7 && (
              <motion.p
                key="greet"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="text-[26px] text-foreground/85 font-light"
                style={fontStyle}
              >
                Nice to meet you, {submittedName}. 🐸
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 5 && step < 7 && (
              <motion.p
                key="ask-age"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="text-[22px] text-foreground/55 font-light"
                style={fontStyle}
              >
                How old are you?
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 6 && step < 7 && (
              <motion.div
                key="ages"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-wrap gap-3 justify-center"
              >
                {[6, 7, 8, 9, 10, 11, 12, 13, 14].map((age, i) => (
                  <motion.button
                    key={age}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleAgeSelect(age)}
                    className={`w-14 h-14 rounded-full text-[18px] font-semibold border border-white/[0.1] hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-200 ${
                      selectedAge === age ? "text-foreground ring-2 ring-creature-frog-glow/50 scale-110" : "text-foreground/85"
                    }`}
                    style={{
                      background: ageColors[i],
                      boxShadow: "0 3px 12px hsla(0, 0%, 0%, 0.25)",
                      ...fontStyle,
                    }}
                  >
                    {age}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 7 && (
              <motion.p
                key="interests"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2 }}
                className="text-[22px] text-foreground/55 font-light"
                style={fontStyle}
              >
                What do you like to talk about?
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 8 && (
              <motion.div
                key="topics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-4"
              >
                <div className="flex flex-wrap gap-3 justify-center">
                  {["Science", "Art", "Games", "Music", "Nature", "Stories"].map((topic, i) => (
                    <motion.button
                      key={topic}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => handleTopicSelect(topic)}
                      className={`px-6 py-3 rounded-full text-[17px] font-medium border border-white/[0.1] hover:text-foreground hover:scale-105 active:scale-95 transition-all duration-200 ${
                        selectedTopics.includes(topic) ? "text-foreground ring-2 ring-creature-frog-glow/50 scale-105" : "text-foreground/85"
                      }`}
                      style={{
                        background: topicColors[i],
                        boxShadow: "0 3px 15px hsla(0, 0%, 0%, 0.25)",
                        ...fontStyle,
                      }}
                    >
                      {topic}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleTopicsDone}
                  className="mx-auto block px-8 py-3 rounded-full text-[18px] font-medium bg-creature-frog text-foreground hover:bg-creature-frog-glow active:scale-95 transition-all duration-200"
                  style={{ boxShadow: "0 4px 15px hsla(120, 30%, 25%, 0.3)", ...fontStyle }}
                >
                  {selectedTopics.length > 0 ? "Let's go! 🐸" : "Skip →"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default OnboardingScreen;
