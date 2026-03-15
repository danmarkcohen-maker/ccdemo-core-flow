import React, { useState } from "react";
import type { StoryArc, StoryBeat, StoryHook } from "@/lib/storyTypes";
import { ChevronDown, ChevronRight, Plus, Trash2, Copy, Upload } from "lucide-react";
import { toast } from "sonner";

const fontStyle = { fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" };

interface StoryArcEditorProps {
  storyArcs: StoryArc[];
  onUpdateArc: (arc: StoryArc) => void;
  onAddArc: (arc: StoryArc) => void;
  onDeleteArc: (id: string) => void;
  onImportArc: (json: string) => boolean;
  onExportArc: (id: string) => string | null;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function newHook(): StoryHook {
  return { id: `hook_${generateId()}`, style: "ambient", text: "", used: false };
}

function newBeat(order: number): StoryBeat {
  return {
    id: `beat_${generateId()}`,
    order,
    title: "New Beat",
    description: "",
    is_canonical_ending: false,
    creature_knowledge: "",
    hooks: [newHook()],
    advancement: { type: "engagement", engagement_signals: [] },
    clues: [],
    requires_clues: [],
  };
}

function newArc(): StoryArc {
  return {
    id: `arc_${generateId()}`,
    title: "New Story Arc",
    description: "",
    status: "inactive",
    beats: [newBeat(1)],
    settings: { cooldown_min: 8, cooldown_max: 20, max_hook_attempts: 3, injection_weight: 0.3 },
  };
}

const StoryArcEditor: React.FC<StoryArcEditorProps> = ({
  storyArcs,
  onUpdateArc,
  onAddArc,
  onDeleteArc,
  onImportArc,
  onExportArc,
}) => {
  const [selectedArcId, setSelectedArcId] = useState<string>(storyArcs[0]?.id ?? "");
  const [expandedBeats, setExpandedBeats] = useState<Set<string>>(new Set());

  const selectedArc = storyArcs.find((a) => a.id === selectedArcId);

  const toggleBeat = (beatId: string) => {
    setExpandedBeats((prev) => {
      const next = new Set(prev);
      next.has(beatId) ? next.delete(beatId) : next.add(beatId);
      return next;
    });
  };

  const updateField = <K extends keyof StoryArc>(key: K, value: StoryArc[K]) => {
    if (!selectedArc) return;
    onUpdateArc({ ...selectedArc, [key]: value });
  };

  const updateSettings = (key: string, value: number) => {
    if (!selectedArc) return;
    onUpdateArc({ ...selectedArc, settings: { ...selectedArc.settings, [key]: value } });
  };

  const updateBeat = (beatIndex: number, updated: StoryBeat) => {
    if (!selectedArc) return;
    const beats = [...selectedArc.beats];
    beats[beatIndex] = updated;
    onUpdateArc({ ...selectedArc, beats });
  };

  const addBeat = () => {
    if (!selectedArc) return;
    const beat = newBeat(selectedArc.beats.length + 1);
    onUpdateArc({ ...selectedArc, beats: [...selectedArc.beats, beat] });
    setExpandedBeats((prev) => new Set(prev).add(beat.id));
  };

  const deleteBeat = (beatIndex: number) => {
    if (!selectedArc) return;
    if (!confirm("Delete this beat?")) return;
    const beats = selectedArc.beats.filter((_, i) => i !== beatIndex).map((b, i) => ({ ...b, order: i + 1 }));
    onUpdateArc({ ...selectedArc, beats });
  };

  const handleExport = () => {
    if (!selectedArcId) return;
    const json = onExportArc(selectedArcId);
    if (json) {
      navigator.clipboard.writeText(json);
      toast.success("Arc JSON copied to clipboard");
    }
  };

  const handleImport = () => {
    const json = prompt("Paste story arc JSON:");
    if (!json) return;
    if (onImportArc(json)) {
      toast.success("Arc imported successfully");
    } else {
      toast.error("Invalid arc JSON");
    }
  };

  const handleAddArc = () => {
    const arc = newArc();
    onAddArc(arc);
    setSelectedArcId(arc.id);
  };

  // Collect all clues from beats before a given index for the requires_clues picker
  const getAvailableClues = (beatIndex: number): string[] => {
    if (!selectedArc) return [];
    return selectedArc.beats.slice(0, beatIndex).flatMap((b) => b.clues);
  };

  return (
    <div className="space-y-4" style={fontStyle}>
      {/* Arc selector */}
      <div className="flex items-center gap-2">
        <select
          value={selectedArcId}
          onChange={(e) => setSelectedArcId(e.target.value)}
          className="flex-1 text-xs rounded-lg border border-border/30 bg-card/50 px-3 py-2 text-foreground/80 focus:outline-none"
        >
          {storyArcs.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title} ({a.status})
            </option>
          ))}
        </select>
        <button
          onClick={handleAddArc}
          className="p-2 rounded-lg border border-border/30 text-muted-foreground/60 hover:text-foreground/70 transition-colors"
          title="New Arc"
        >
          <Plus size={14} />
        </button>
      </div>

      {selectedArc && (
        <>
          {/* Arc settings */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Arc Settings
            </label>
            <input
              value={selectedArc.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full text-xs rounded-lg border border-border/30 bg-card/50 px-3 py-2 text-foreground/80 focus:outline-none focus:border-[hsl(var(--creature-frog-glow))]"
              placeholder="Arc title"
            />
            <textarea
              value={selectedArc.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full h-16 text-xs rounded-lg border border-border/30 bg-card/50 px-3 py-2 text-foreground/80 resize-y focus:outline-none focus:border-[hsl(var(--creature-frog-glow))]"
              placeholder="Arc description"
            />

            <div className="grid grid-cols-2 gap-2">
              <NumberField label="Cooldown Min" value={selectedArc.settings.cooldown_min} onChange={(v) => updateSettings("cooldown_min", v)} />
              <NumberField label="Cooldown Max" value={selectedArc.settings.cooldown_max} onChange={(v) => updateSettings("cooldown_max", v)} />
              <NumberField label="Max Hook Attempts" value={selectedArc.settings.max_hook_attempts} onChange={(v) => updateSettings("max_hook_attempts", v)} />
              <div>
                <span className="text-[9px] text-muted-foreground/50 block mb-1">Injection Weight</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={selectedArc.settings.injection_weight}
                    onChange={(e) => updateSettings("injection_weight", parseFloat(e.target.value))}
                    className="flex-1 h-1 accent-[hsl(var(--creature-frog-glow))]"
                  />
                  <span className="text-[10px] text-foreground/60 w-7 text-right">
                    {selectedArc.settings.injection_weight.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Beat list */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Beats ({selectedArc.beats.length})
            </label>
            <div className="space-y-1.5">
              {selectedArc.beats.map((beat, bi) => {
                const isExpanded = expandedBeats.has(beat.id);
                return (
                  <div
                    key={beat.id}
                    className="rounded-lg border border-border/20 overflow-hidden"
                    style={{ background: "hsla(230, 14%, 10%, 0.6)" }}
                  >
                    {/* Beat header */}
                    <button
                      onClick={() => toggleBeat(beat.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-border/10 transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={12} className="text-muted-foreground/40" /> : <ChevronRight size={12} className="text-muted-foreground/40" />}
                      <span className="text-[10px] font-bold text-muted-foreground/40 w-5">{beat.order}</span>
                      <span className="text-xs text-foreground/70 flex-1">{beat.title}</span>
                      {beat.is_canonical_ending && <span className="text-[8px] text-[hsl(var(--creature-frog-glow))]">★ END</span>}
                    </button>

                    {/* Expanded beat editor */}
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2 border-t border-border/10">
                        <input
                          value={beat.title}
                          onChange={(e) => updateBeat(bi, { ...beat, title: e.target.value })}
                          className="w-full text-xs rounded border border-border/20 bg-card/30 px-2 py-1.5 text-foreground/80 focus:outline-none mt-2"
                          placeholder="Beat title"
                        />
                        <textarea
                          value={beat.description}
                          onChange={(e) => updateBeat(bi, { ...beat, description: e.target.value })}
                          className="w-full h-12 text-[10px] rounded border border-border/20 bg-card/30 px-2 py-1.5 text-foreground/70 resize-y focus:outline-none"
                          placeholder="Description"
                        />
                        <div>
                          <span className="text-[9px] text-muted-foreground/50">Creature Knowledge</span>
                          <textarea
                            value={beat.creature_knowledge}
                            onChange={(e) => updateBeat(bi, { ...beat, creature_knowledge: e.target.value })}
                            className="w-full h-16 text-[10px] rounded border border-border/20 bg-card/30 px-2 py-1.5 text-foreground/70 resize-y focus:outline-none"
                            placeholder="What the creature knows at this beat..."
                          />
                        </div>

                        {/* Hooks */}
                        <div>
                          <span className="text-[9px] text-muted-foreground/50">Hooks</span>
                          {beat.hooks.map((hook, hi) => (
                            <div key={hook.id} className="mt-1 p-2 rounded border border-border/15 space-y-1" style={{ background: "hsla(230, 14%, 8%, 0.5)" }}>
                              <div className="flex items-center gap-2">
                                <select
                                  value={hook.style}
                                  onChange={(e) => {
                                    const hooks = [...beat.hooks];
                                    hooks[hi] = { ...hook, style: e.target.value as StoryHook["style"] };
                                    updateBeat(bi, { ...beat, hooks });
                                  }}
                                  className="text-[10px] rounded border border-border/20 bg-card/30 px-1.5 py-1 text-foreground/70"
                                >
                                  <option value="ambient">Ambient</option>
                                  <option value="curious">Curious</option>
                                  <option value="excited">Excited</option>
                                  <option value="worried">Worried</option>
                                </select>
                                <span className={`w-2 h-2 rounded-full ${hook.used ? "bg-[hsl(var(--creature-frog-glow))]" : "bg-muted-foreground/20"}`} title={hook.used ? "Used" : "Unused"} />
                                <button
                                  onClick={() => {
                                    const hooks = beat.hooks.filter((_, j) => j !== hi);
                                    updateBeat(bi, { ...beat, hooks });
                                  }}
                                  className="ml-auto text-muted-foreground/30 hover:text-destructive/60"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                              <textarea
                                value={hook.text}
                                onChange={(e) => {
                                  const hooks = [...beat.hooks];
                                  hooks[hi] = { ...hook, text: e.target.value };
                                  updateBeat(bi, { ...beat, hooks });
                                }}
                                className="w-full h-12 text-[10px] rounded border border-border/15 bg-card/20 px-2 py-1 text-foreground/60 resize-y focus:outline-none"
                                placeholder="Hook guidance for the LLM..."
                              />
                            </div>
                          ))}
                          <button
                            onClick={() => updateBeat(bi, { ...beat, hooks: [...beat.hooks, newHook()] })}
                            className="mt-1 flex items-center gap-1 text-[9px] text-[hsl(var(--creature-frog-glow))]/60 hover:text-[hsl(var(--creature-frog-glow))]"
                          >
                            <Plus size={10} /> Add Hook
                          </button>
                        </div>

                        {/* Advancement */}
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-muted-foreground/50">Advancement:</span>
                          <label className="flex items-center gap-1 text-[10px] text-foreground/60">
                            <input
                              type="radio"
                              checked={beat.advancement.type === "engagement"}
                              onChange={() => updateBeat(bi, { ...beat, advancement: { ...beat.advancement, type: "engagement" } })}
                              className="accent-[hsl(var(--creature-frog-glow))]"
                            />
                            Engagement
                          </label>
                          <label className="flex items-center gap-1 text-[10px] text-foreground/60">
                            <input
                              type="radio"
                              checked={beat.advancement.type === "auto"}
                              onChange={() => updateBeat(bi, { ...beat, advancement: { ...beat.advancement, type: "auto" } })}
                              className="accent-[hsl(var(--creature-frog-glow))]"
                            />
                            Auto
                          </label>
                        </div>

                        {/* Canonical ending toggle */}
                        <label className="flex items-center gap-2 text-[10px] text-foreground/60">
                          <input
                            type="checkbox"
                            checked={beat.is_canonical_ending}
                            onChange={(e) => updateBeat(bi, { ...beat, is_canonical_ending: e.target.checked })}
                            className="accent-[hsl(var(--creature-frog-glow))]"
                          />
                          Canonical ending
                        </label>

                        {/* Clues */}
                        <TagInput
                          label="Clues"
                          value={beat.clues}
                          onChange={(clues) => updateBeat(bi, { ...beat, clues })}
                        />

                        {/* Required clues */}
                        <TagInput
                          label="Required Clues"
                          value={beat.requires_clues || []}
                          onChange={(requires_clues) => updateBeat(bi, { ...beat, requires_clues })}
                          suggestions={getAvailableClues(bi)}
                        />

                        {/* Engagement signals */}
                        <TagInput
                          label="Engagement Signals"
                          value={beat.advancement.engagement_signals}
                          onChange={(signals) => updateBeat(bi, { ...beat, advancement: { ...beat.advancement, engagement_signals: signals } })}
                        />

                        {/* Delete beat */}
                        <button
                          onClick={() => deleteBeat(bi)}
                          className="flex items-center gap-1 text-[9px] text-destructive/50 hover:text-destructive/80 mt-1"
                        >
                          <Trash2 size={10} /> Delete Beat
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={addBeat}
              className="mt-2 flex items-center gap-1 text-[10px] text-[hsl(var(--creature-frog-glow))]/60 hover:text-[hsl(var(--creature-frog-glow))]"
            >
              <Plus size={12} /> Add Beat
            </button>
          </div>

          {/* Import/Export + Delete */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/20">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-foreground/70 transition-colors"
            >
              <Copy size={10} /> Export JSON
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-foreground/70 transition-colors"
            >
              <Upload size={10} /> Import JSON
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete "${selectedArc.title}"?`)) {
                  onDeleteArc(selectedArc.id);
                  setSelectedArcId(storyArcs[0]?.id ?? "");
                }
              }}
              className="ml-auto flex items-center gap-1 text-[10px] text-destructive/50 hover:text-destructive/80 transition-colors"
            >
              <Trash2 size={10} /> Delete Arc
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Simple tag input component
function TagInput({
  label,
  value,
  onChange,
  suggestions,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  suggestions?: string[];
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput("");
    }
  };

  return (
    <div>
      <span className="text-[9px] text-muted-foreground/50">{label}</span>
      <div className="flex flex-wrap gap-1 mt-0.5">
        {value.map((tag, i) => (
          <span
            key={i}
            className="text-[9px] px-1.5 py-0.5 rounded-full border border-border/20 text-foreground/50 flex items-center gap-1"
            style={{ background: "hsla(230, 14%, 15%, 0.6)" }}
          >
            {tag}
            <button
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="text-muted-foreground/30 hover:text-destructive/60"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1 mt-1">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          className="flex-1 text-[10px] rounded border border-border/20 bg-card/20 px-2 py-1 text-foreground/60 focus:outline-none"
          placeholder={`Add ${label.toLowerCase()}...`}
        />
        {suggestions && suggestions.length > 0 && (
          <select
            value=""
            onChange={(e) => {
              if (e.target.value && !value.includes(e.target.value)) {
                onChange([...value, e.target.value]);
              }
            }}
            className="text-[9px] rounded border border-border/20 bg-card/20 px-1 text-foreground/50"
          >
            <option value="">Pick...</option>
            {suggestions.filter((s) => !value.includes(s)).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <span className="text-[9px] text-muted-foreground/50 block mb-1">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full text-xs rounded border border-border/20 bg-card/30 px-2 py-1.5 text-foreground/70 focus:outline-none"
      />
    </div>
  );
}

export default StoryArcEditor;
