import React from "react";
import type { StoryState, StoryArc } from "@/lib/storyTypes";
import { ChevronRight, FastForward, Rewind, RotateCcw, Zap, CheckCircle } from "lucide-react";

const fontStyle = { fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" };

interface StoryStateDisplayProps {
  storyState: StoryState;
  storyArcs: StoryArc[];
  onAdvanceBeat: () => void;
  onRewindBeat: () => void;
  onResetArc: () => void;
  onForceHook: () => void;
  onCompleteArc: () => void;
}

const engagementColors: Record<string, string> = {
  none: "hsla(0, 0%, 50%, 0.5)",
  acknowledged: "hsla(45, 80%, 55%, 0.8)",
  curious: "hsla(210, 70%, 60%, 0.8)",
  actively_exploring: "hsla(120, 60%, 50%, 0.8)",
};

const StoryStateDisplay: React.FC<StoryStateDisplayProps> = ({
  storyState,
  storyArcs,
  onAdvanceBeat,
  onRewindBeat,
  onResetArc,
  onForceHook,
  onCompleteArc,
}) => {
  const activeArc = storyArcs.find((a) => a.id === storyState.active_arc_id);
  const currentBeat = activeArc?.beats[storyState.current_beat_index];
  const settings = activeArc?.settings;

  return (
    <div className="space-y-3" style={fontStyle}>
      {/* Arc status */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Active Story Arc
        </label>
        {activeArc ? (
          <div
            className="mt-2 px-3 py-2.5 rounded-lg border border-[hsl(var(--creature-frog))]/30"
            style={{ background: "hsla(120, 20%, 15%, 0.4)" }}
          >
            <p className="text-xs font-semibold text-foreground/90">{activeArc.title}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{activeArc.description}</p>
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground/40 mt-2">
            {storyState.completed_arcs.length > 0
              ? "All arcs completed"
              : "No active arc"}
          </p>
        )}
      </div>

      {/* Current beat */}
      {activeArc && currentBeat && (
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Current Beat
          </label>
          <div
            className="mt-1.5 px-3 py-2 rounded-lg border border-border/30"
            style={{ background: "hsla(230, 14%, 12%, 0.8)" }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground/80">
                {currentBeat.title}
              </p>
              <span className="text-[9px] text-muted-foreground/50">
                Beat {storyState.current_beat_index + 1} of {activeArc.beats.length}
              </span>
            </div>
            {currentBeat.is_canonical_ending && (
              <span className="text-[9px] text-[hsl(var(--creature-frog-glow))] mt-1 inline-block">
                ★ Canonical Ending
              </span>
            )}
          </div>
        </div>
      )}

      {/* Cooldown bar */}
      {activeArc && settings && (
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Story Hook Cooldown
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsla(230, 14%, 15%, 0.8)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (storyState.messages_since_last_hook / settings.cooldown_max) * 100)}%`,
                  background:
                    storyState.messages_since_last_hook >= settings.cooldown_max
                      ? "hsl(0, 60%, 50%)"
                      : storyState.messages_since_last_hook >= settings.cooldown_min
                      ? "hsl(var(--creature-frog-glow))"
                      : "hsla(230, 14%, 30%, 0.6)",
                }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground/50 shrink-0 w-8 text-right">
              {storyState.messages_since_last_hook}/{settings.cooldown_max}
            </span>
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[8px] text-muted-foreground/30">min: {settings.cooldown_min}</span>
            <span className="text-[8px] text-muted-foreground/30">max: {settings.cooldown_max}</span>
          </div>
        </div>
      )}

      {/* Hook attempts */}
      {activeArc && settings && (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <span className="text-[10px] text-muted-foreground/50">Hook Attempts</span>
            <p className="text-xs font-medium text-foreground/70">
              {storyState.hook_attempts_this_beat} / {settings.max_hook_attempts}
            </p>
          </div>
          {storyState.force_hook_next && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(var(--creature-frog))]/30 text-[hsl(var(--creature-frog-glow))]">
              ⚡ Force next
            </span>
          )}
        </div>
      )}

      {/* Known clues */}
      <div>
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Known Clues
        </label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {storyState.known_clues.length === 0 ? (
            <span className="text-[10px] text-muted-foreground/30">None yet</span>
          ) : (
            storyState.known_clues.map((clue, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-1 rounded-full border text-foreground/70"
                style={{
                  borderColor: "hsla(35, 60%, 50%, 0.3)",
                  background: "hsla(35, 60%, 50%, 0.12)",
                  color: "hsl(35, 60%, 65%)",
                }}
              >
                {clue}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Engagement history */}
      {storyState.child_engagement_history.length > 0 && (
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Engagement History
          </label>
          <div className="mt-1.5 space-y-1">
            {storyState.child_engagement_history.slice(-5).reverse().map((entry, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[10px]"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: engagementColors[entry.engagement_level] || engagementColors.none }}
                />
                <span className="text-muted-foreground/60">{entry.beat_id}</span>
                <span className="text-foreground/50 ml-auto">{entry.engagement_level}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control buttons */}
      {activeArc && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/20">
          <ControlBtn icon={<ChevronRight size={11} />} label="Advance" onClick={onAdvanceBeat} />
          <ControlBtn icon={<Rewind size={11} />} label="Rewind" onClick={onRewindBeat} />
          <ControlBtn icon={<RotateCcw size={11} />} label="Reset" onClick={onResetArc} />
          <ControlBtn icon={<Zap size={11} />} label="Force Hook" onClick={onForceHook} accent />
          <ControlBtn icon={<CheckCircle size={11} />} label="Complete" onClick={onCompleteArc} />
        </div>
      )}

      {/* Completed arcs */}
      {storyState.completed_arcs.length > 0 && (
        <div className="pt-2 border-t border-border/20">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Completed Arcs
          </label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {storyState.completed_arcs.map((id) => {
              const arc = storyArcs.find((a) => a.id === id);
              return (
                <span
                  key={id}
                  className="text-[10px] px-2 py-1 rounded-full border border-border/20 text-muted-foreground/50"
                  style={{ background: "hsla(230, 14%, 12%, 0.8)" }}
                >
                  ✓ {arc?.title || id}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

function ControlBtn({
  icon,
  label,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all border ${
        accent
          ? "border-[hsl(var(--creature-frog))]/40 text-[hsl(var(--creature-frog-glow))] hover:bg-[hsl(var(--creature-frog))]/20"
          : "border-border/30 text-muted-foreground/60 hover:text-foreground/70 hover:border-border/50"
      }`}
      style={{ background: accent ? "hsla(120, 20%, 15%, 0.3)" : "transparent" }}
    >
      {icon}
      {label}
    </button>
  );
}

export default StoryStateDisplay;
