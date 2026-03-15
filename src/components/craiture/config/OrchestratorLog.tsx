import React from "react";
import type { OrchestratorMeta } from "@/lib/storyTypes";

const fontStyle = { fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" };

interface OrchestratorLogProps {
  entries: OrchestratorMeta[];
}

const intentColors: Record<string, string> = {
  casual_chat: "hsla(210, 60%, 60%, 0.8)",
  homework_help: "hsla(45, 70%, 60%, 0.8)",
  emotional_support: "hsla(280, 60%, 60%, 0.8)",
  story_followup: "hsla(120, 60%, 55%, 0.8)",
  story_curious: "hsla(160, 60%, 55%, 0.8)",
  creative_play: "hsla(330, 60%, 60%, 0.8)",
  question_about_world: "hsla(200, 60%, 60%, 0.8)",
  question_about_creature: "hsla(35, 60%, 60%, 0.8)",
};

const toneEmojis: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  anxious: "😰",
  excited: "🤩",
  neutral: "😐",
  frustrated: "😤",
  silly: "🤪",
};

const OrchestratorLog: React.FC<OrchestratorLogProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div style={fontStyle}>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Orchestrator Log
        </label>
        <p className="text-[10px] text-muted-foreground/40 mt-2">No decisions yet — send a message to see orchestrator output.</p>
      </div>
    );
  }

  return (
    <div style={fontStyle} className="space-y-3">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Orchestrator Log
      </label>
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
        {entries.map((entry, i) => (
          <div
            key={i}
            className="px-3 py-2 rounded-lg border border-border/20 space-y-1"
            style={{ background: "hsla(230, 14%, 10%, 0.6)" }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              {/* Intent */}
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ background: `${intentColors[entry.intent] || "hsla(0,0%,50%,0.3)"}20`, color: intentColors[entry.intent] || "hsla(0,0%,60%,0.8)" }}
              >
                {entry.intent}
              </span>
              {/* Tone */}
              <span className="text-[10px]" title={entry.emotional_tone}>
                {toneEmojis[entry.emotional_tone] || "😐"} {entry.emotional_tone}
              </span>
              {/* Safety */}
              {entry.safety_flagged && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/20 text-destructive">
                  🛡️ FLAGGED
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap text-[9px] text-muted-foreground/50">
              {/* Story engagement */}
              {entry.story_engagement !== "none" && (
                <span className="text-[hsl(var(--creature-frog-glow))]">
                  story: {entry.story_engagement}
                </span>
              )}
              {entry.story_hook_attempted && <span>🎣 hook sent</span>}
              {entry.beat_advanced && <span className="text-[hsl(var(--creature-frog-glow))]">⏭ beat advanced</span>}
              {entry.memory_updated && <span>📝 memory</span>}
            </div>

            {/* Response validation */}
            {entry.response_validation && !entry.response_validation.passed && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] text-amber-400/80">⚠️ response:</span>
                {entry.response_validation.flags.map((flag) => (
                  <span
                    key={flag}
                    className="text-[8px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{
                      background: flag === "unsafe_content" ? "hsla(0, 70%, 50%, 0.2)" : "hsla(40, 70%, 50%, 0.2)",
                      color: flag === "unsafe_content" ? "hsla(0, 70%, 65%, 1)" : "hsla(40, 70%, 65%, 1)",
                    }}
                  >
                    {flag}
                  </span>
                ))}
              </div>
            )}

            {/* Context sections */}
            <div className="flex flex-wrap gap-1">
              {entry.context_sections_used.map((section) => (
                <span
                  key={section}
                  className="text-[8px] px-1 py-0.5 rounded border border-border/15 text-muted-foreground/40"
                >
                  {section}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrchestratorLog;
