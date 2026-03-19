import React, { useState, useMemo } from "react";
import type { ChatMessage } from "@/components/craiture/screens/ChatScreen";
import type { SessionStats, AllTimeStats, ExtractedMemories } from "@/hooks/useConfigPanel";
import type { CreatureConfig, OrchestratorConfig, OrchestratorMeta, ReflectionOutput } from "@/hooks/useCreatureConfig";
import { X, RefreshCw, ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";

const fontStyle = { fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" };

type Tab = "prompt" | "memory" | "stats" | "creature" | "orchestrator";

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt: string;
  onSystemPromptChange: (v: string) => void;
  rules: string;
  onRulesChange: (v: string) => void;
  defaultPrompt: string;
  defaultRules: string;
  chatMessages: ChatMessage[];
  sessionStats: SessionStats;
  allTimeStats: AllTimeStats;
  onResetAllTime: () => void;
  userName: string;
  memories: ExtractedMemories;
  isExtracting: boolean;
  onReExtract: () => void;
  onClearMemories: () => void;
  // Creature
  creature: CreatureConfig;
  onPersonalityChange: (v: string) => void;
  onBackstoryChange: (v: string) => void;
  onThreadsChange: (v: string) => void; // JSON string
  onDailyLifeChange: (v: string) => void;
  onLedgerChange: (v: string) => void;
  onChildProfileChange: (v: string) => void;
  onAddThread: () => void;
  onAdvanceAll: () => void;
  onResetCreature: () => void;
  defaultPersonality: string;
  defaultBackstory: string;
  defaultDailyLife: string;
  // Orchestrator
  orchestrator: OrchestratorConfig;
  onOrchestratorChange: (partial: Partial<OrchestratorConfig>) => void;
  onToggleSection: (s: string) => void;
  onResetOrchestrator: () => void;
  orchestratorLog: OrchestratorMeta[];
  allSections: readonly string[];
  defaultDeflections: string;
  // Reflection debug
  lastReflection: ReflectionOutput | null;
  lastSessionSummary: string;
}

// Cost estimates
const COST_PER_M_INPUT = 0.10;
const COST_PER_M_OUTPUT = 0.40;
const COST_PER_M_INPUT_LITE = 0.025;
const COST_PER_M_OUTPUT_LITE = 0.10;

function estimateCost(promptTokens: number, completionTokens: number): string {
  const cost = (promptTokens / 1_000_000) * COST_PER_M_INPUT + (completionTokens / 1_000_000) * COST_PER_M_OUTPUT;
  return cost < 0.001 ? "<$0.001" : `$${cost.toFixed(4)}`;
}

function estimateMemoryCost(totalTokens: number): string {
  const input = totalTokens * 0.8;
  const output = totalTokens * 0.2;
  const cost = (input / 1_000_000) * COST_PER_M_INPUT_LITE + (output / 1_000_000) * COST_PER_M_OUTPUT_LITE;
  return cost < 0.001 ? "<$0.001" : `$${cost.toFixed(4)}`;
}

const INTENT_COLORS: Record<string, string> = {
  casual_chat: "hsl(200, 60%, 55%)",
  homework_help: "hsl(40, 70%, 55%)",
  emotional_support: "hsl(330, 60%, 60%)",
  creative_play: "hsl(280, 60%, 60%)",
  question_about_creature: "hsl(var(--creature-frog-glow))",
  question_about_world: "hsl(160, 50%, 50%)",
  advice_response: "hsl(50, 70%, 55%)",
  blocked: "hsl(0, 70%, 55%)",
};

const TONE_EMOJI: Record<string, string> = {
  happy: "😊", sad: "😢", anxious: "😰", excited: "🤩",
  neutral: "😐", frustrated: "😤", silly: "🤪",
};

const ConfigPanel: React.FC<ConfigPanelProps> = (props) => {
  const {
    isOpen, onClose, systemPrompt, onSystemPromptChange, rules, onRulesChange,
    defaultPrompt, defaultRules, chatMessages, sessionStats, allTimeStats,
    onResetAllTime, userName, memories, isExtracting, onReExtract, onClearMemories,
    creature, onPersonalityChange, onBackstoryChange, onThreadsChange,
    onDailyLifeChange, onLedgerChange, onChildProfileChange, onAddThread, onAdvanceAll, onResetCreature,
    defaultPersonality, defaultBackstory, defaultDailyLife,
    orchestrator, onOrchestratorChange, onToggleSection, onResetOrchestrator,
    orchestratorLog, allSections, defaultDeflections,
    lastReflection, lastSessionSummary,
  } = props;

  const [tab, setTab] = useState<Tab>("creature");

  const sessionMetrics = useMemo(() => {
    const msgs = sessionStats.messages;
    if (msgs.length === 0) return null;
    const totalPrompt = msgs.reduce((s, m) => s + m.promptTokens, 0);
    const totalCompletion = msgs.reduce((s, m) => s + m.completionTokens, 0);
    const totalTokens = msgs.reduce((s, m) => s + m.totalTokens, 0);
    const avgUserLen = msgs.reduce((s, m) => s + m.userMsgLength, 0) / msgs.length;
    const avgAssistantLen = msgs.reduce((s, m) => s + m.assistantMsgLength, 0) / msgs.length;
    const avgTokensPerResponse = totalCompletion / msgs.length;
    return {
      messageCount: msgs.length, totalPrompt, totalCompletion, totalTokens,
      avgUserLen: Math.round(avgUserLen), avgAssistantLen: Math.round(avgAssistantLen),
      avgTokensPerResponse: Math.round(avgTokensPerResponse),
      cost: estimateCost(totalPrompt, totalCompletion),
      responseLengths: msgs.map((m) => m.assistantMsgLength),
    };
  }, [sessionStats]);

  const topics = useMemo(() => {
    const topicWords = new Set<string>();
    const stopWords = new Set(["the", "a", "an", "is", "it", "i", "you", "we", "they", "my", "your", "do", "does", "did", "have", "has", "had", "was", "were", "be", "been", "am", "are", "what", "how", "why", "when", "where", "who", "that", "this", "and", "or", "but", "so", "if", "to", "of", "in", "on", "at", "for", "with", "about", "from", "up", "out", "not", "no", "yes", "can", "will", "would", "could", "should", "just", "like", "think", "know", "really", "very", "too", "also", "don't", "dont", "it's", "its", "i'm", "im", "kind", "actually", "pretty", "much", "want", "going", "thing", "things", "well", "yeah", "okay", "sure", "right", "good", "nice", "cool", "great", "some", "more", "then", "than", "them", "here", "there", "been", "being", "into", "over", "only", "come", "came", "make", "made", "take", "took", "tell", "told", "said", "says", "goes", "went", "back", "still", "even", "ever", "never", "always"]);
    for (const msg of chatMessages) {
      if (!msg.isUser) continue;
      const words = msg.message.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
      for (const w of words) {
        if (w.length > 3 && !stopWords.has(w)) topicWords.add(w);
      }
    }
    return Array.from(topicWords).slice(0, 15);
  }, [chatMessages]);

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "creature", label: "Creature" },
    { id: "orchestrator", label: "Orch" },
    { id: "prompt", label: "Prompt" },
    { id: "memory", label: "Memory" },
    { id: "stats", label: "Stats" },
  ];

  // Parse threads for structured editing
  let parsedThreads: any[] = [];
  try {
    parsedThreads = creature.threads || [];
  } catch { parsedThreads = []; }

  return (
    <div
      className="fixed top-0 right-0 h-full z-[60] flex flex-col border-l border-border/40"
      style={{ width: 420, background: "hsl(230, 18%, 7%)", ...fontStyle }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex gap-1 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                tab === t.id
                  ? "bg-[hsl(var(--creature-frog))] text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ═══ CREATURE TAB ═══ */}
        {tab === "creature" && (
          <>
            <SectionEditor
              label="Creature Personality"
              value={creature.personality}
              onChange={onPersonalityChange}
              onReset={() => onPersonalityChange(defaultPersonality)}
              rows={6}
            />
            <SectionEditor
              label="Backstory Lore"
              value={creature.backstory}
              onChange={onBackstoryChange}
              onReset={() => onBackstoryChange(defaultBackstory)}
              rows={10}
              note="Use ## headers to define sections. The orchestrator selects relevant sections based on conversation topics."
            />

            {/* Life Threads — structured editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Life Threads</label>
                <div className="flex gap-2">
                  <button onClick={onAddThread} className="text-[10px] text-[hsl(var(--creature-frog-glow))]/70 hover:text-[hsl(var(--creature-frog-glow))] transition-colors">+ Add</button>
                  <button onClick={onAdvanceAll} className="text-[10px] text-[hsl(var(--creature-frog-glow))]/70 hover:text-[hsl(var(--creature-frog-glow))] transition-colors">⏩ Advance All</button>
                  <button onClick={onResetCreature} className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Reset</button>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground/40 mb-2">
                Threads advance via the reflection system, not timers. The LLM decides when developments happen.
              </p>

              <div className="space-y-3">
                {parsedThreads.map((thread, idx) => (
                  <ThreadEditor
                    key={thread.id || idx}
                    thread={thread}
                    onChange={(updated) => {
                      const newThreads = [...parsedThreads];
                      newThreads[idx] = updated;
                      onThreadsChange(JSON.stringify(newThreads));
                    }}
                    onRemove={() => {
                      const newThreads = parsedThreads.filter((_, i) => i !== idx);
                      onThreadsChange(JSON.stringify(newThreads));
                    }}
                  />
                ))}
              </div>
            </div>

            <SectionEditor
              label="Daily Life Prompt"
              value={creature.dailyLifePrompt}
              onChange={onDailyLifeChange}
              onReset={() => onDailyLifeChange(defaultDailyLife)}
              rows={5}
            />

            {creature.completedThreads.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed Threads</label>
                <div className="mt-2 space-y-1">
                  {creature.completedThreads.map((t, i) => (
                    <p key={i} className="text-[10px] text-muted-foreground/50 pl-2 border-l-2 border-border/20">{t}</p>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══ ORCHESTRATOR TAB ═══ */}
        {tab === "orchestrator" && (
          <>
            {/* Pipeline Controls */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pipeline Controls</label>
              <div className="mt-3 space-y-2.5">
                <ToggleRow label="Safety Gate" checked={orchestrator.safetyGateEnabled} onChange={(v) => onOrchestratorChange({ safetyGateEnabled: v })} />
                <ToggleRow label="Intent Classification" checked={orchestrator.intentClassificationEnabled} onChange={(v) => onOrchestratorChange({ intentClassificationEnabled: v })} />

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground/70">Max Context Tokens</span>
                    <span className="text-[10px] text-foreground/60 font-mono">{orchestrator.maxContextTokens}</span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={4000}
                    step={100}
                    value={orchestrator.maxContextTokens}
                    onChange={(e) => onOrchestratorChange({ maxContextTokens: parseInt(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: "hsl(230, 14%, 20%)" }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground/70">Response Length Limit</span>
                    <span className="text-[10px] text-foreground/60 font-mono">{orchestrator.responseLengthLimit} words</span>
                  </div>
                  <input
                    type="number"
                    min={50}
                    max={500}
                    value={orchestrator.responseLengthLimit}
                    onChange={(e) => onOrchestratorChange({ responseLengthLimit: parseInt(e.target.value) || 200 })}
                    className="w-20 px-2 py-1 rounded border border-border/30 bg-card/50 text-xs text-foreground/80 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Session Settings */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Session Settings</label>
              <div className="mt-3 space-y-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground/70">Session Timeout</span>
                    <span className="text-[10px] text-foreground/60 font-mono">{orchestrator.sessionTimeoutMinutes} min</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={120}
                    step={5}
                    value={orchestrator.sessionTimeoutMinutes}
                    onChange={(e) => onOrchestratorChange({ sessionTimeoutMinutes: parseInt(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: "hsl(230, 14%, 20%)" }}
                  />
                  <p className="text-[9px] text-muted-foreground/40 mt-1">Time gap (minutes) before reflection runs on next session start.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground/70">Profile Update Frequency</span>
                  </div>
                  <div className="flex gap-1.5">
                    {(["every", "every3", "manual"] as const).map((freq) => (
                      <button
                        key={freq}
                        onClick={() => onOrchestratorChange({ profileUpdateFrequency: freq })}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                          orchestrator.profileUpdateFrequency === freq
                            ? "border-[hsl(var(--creature-frog))]/50 bg-[hsl(var(--creature-frog))]/15 text-foreground/80"
                            : "border-border/20 text-muted-foreground/40"
                        }`}
                      >
                        {freq === "every" ? "Every response" : freq === "every3" ? "Every 3" : "Manual"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Context Sections */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Context Sections</label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {allSections.map((s) => (
                  <button
                    key={s}
                    onClick={() => onToggleSection(s)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                      orchestrator.enabledSections.includes(s)
                        ? "border-[hsl(var(--creature-frog))]/50 bg-[hsl(var(--creature-frog))]/15 text-foreground/80"
                        : "border-border/20 text-muted-foreground/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Safety Deflections */}
            <SectionEditor
              label="Safety Deflections"
              value={orchestrator.safetyDeflections}
              onChange={(v) => onOrchestratorChange({ safetyDeflections: v })}
              onReset={() => onOrchestratorChange({ safetyDeflections: defaultDeflections })}
              rows={4}
              note="One deflection per line. Random selection when safety gate blocks a message."
            />

            {/* Last Reflection */}
            {lastReflection && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Reflection</label>
                <div className="mt-2 px-3 py-2 rounded-lg border border-border/20 space-y-2" style={{ background: "hsla(230, 14%, 12%, 0.8)" }}>
                  {lastReflection.follow_up && (
                    <div>
                      <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">Follow-up</p>
                      <p className="text-[10px] text-foreground/70">{lastReflection.follow_up}</p>
                    </div>
                  )}
                  {lastReflection.thread_updates && lastReflection.thread_updates.length > 0 && (
                    <div>
                      <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">Thread Updates</p>
                      {lastReflection.thread_updates.map((tu, i) => (
                        <p key={i} className="text-[10px] text-foreground/70">
                          <span className={tu.advance ? "text-[hsl(var(--creature-frog-glow))]" : "text-muted-foreground/50"}>
                            {tu.advance ? "✓" : "✗"} {tu.thread_id}
                          </span>
                          {tu.reason && <span className="text-muted-foreground/40"> — {tu.reason}</span>}
                        </p>
                      ))}
                    </div>
                  )}
                  <div>
                    <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">Mood</p>
                    <p className="text-[10px] text-foreground/70">{lastReflection.creature_mood}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">Opener Hint</p>
                    <p className="text-[10px] text-foreground/70">{lastReflection.opener_hint}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Last Message Debug */}
            {orchestratorLog.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Message</label>
                <OrchestratorDebug meta={orchestratorLog[0]} />
              </div>
            )}

            {/* Orchestrator Log */}
            {orchestratorLog.length > 1 && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Log ({orchestratorLog.length})</label>
                <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
                  {orchestratorLog.slice(1).map((meta, i) => (
                    <OrchestratorDebug key={i} meta={meta} compact />
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onResetOrchestrator}
              className="text-[10px] text-destructive/60 hover:text-destructive transition-colors"
            >
              Reset Orchestrator to Defaults
            </button>
          </>
        )}

        {/* ═══ PROMPT TAB ═══ */}
        {tab === "prompt" && (
          <>
            <p className="text-[10px] text-muted-foreground/50 leading-relaxed border-l-2 border-border/20 pl-2">
              Leave empty to use Creature tab personality, or enter a custom prompt to override.
            </p>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Prompt</label>
                <button onClick={() => onSystemPromptChange(defaultPrompt)} className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Reset</button>
              </div>
              <textarea
                value={systemPrompt}
                onChange={(e) => onSystemPromptChange(e.target.value)}
                className="w-full h-48 rounded-lg border border-border/30 bg-card/50 px-3 py-2 text-xs text-foreground/90 resize-y focus:outline-none focus:border-[hsl(var(--creature-frog-glow))] transition-colors"
                spellCheck={false}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Behavioral Rules</label>
                <button onClick={() => onRulesChange(defaultRules)} className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Reset</button>
              </div>
              <textarea
                value={rules}
                onChange={(e) => onRulesChange(e.target.value)}
                className="w-full h-36 rounded-lg border border-border/30 bg-card/50 px-3 py-2 text-xs text-foreground/90 resize-y focus:outline-none focus:border-[hsl(var(--creature-frog-glow))] transition-colors"
                spellCheck={false}
              />
            </div>
            <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
              Changes apply on next message. System prompt + rules + memories are combined and sent to the model.
              Changing prompt/rules starts a new stats session for A/B comparison.
            </p>
          </>
        )}

        {/* ═══ MEMORY TAB ═══ */}
        {tab === "memory" && (
          <>
            {/* Child Profile — living document */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Child Profile</label>
                <button onClick={onReExtract} disabled={isExtracting} className="flex items-center gap-1 text-[10px] text-[hsl(var(--creature-frog-glow))]/70 hover:text-[hsl(var(--creature-frog-glow))] transition-colors disabled:opacity-40">
                  <RefreshCw size={10} className={isExtracting ? "animate-spin" : ""} />
                  {isExtracting ? "Updating…" : "Re-extract from Chat"}
                </button>
              </div>
              <p className="text-[9px] text-muted-foreground/40 mb-2">
                A living document updated by the LLM after conversations. Captures the child's life, interests, and context.
              </p>
              <textarea
                value={creature.childProfile}
                onChange={(e) => onChildProfileChange(e.target.value)}
                placeholder={`Name: ${userName}\nAge: ...\nInterests: ...\nLife context: ...\nFriends: ...\nFeeling lately: ...`}
                className="w-full h-48 rounded-lg border border-border/30 bg-card/50 px-3 py-2 text-xs text-foreground/90 resize-y focus:outline-none focus:border-[hsl(var(--creature-frog-glow))] transition-colors"
                spellCheck={false}
              />
            </div>

            {/* Relationship Notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Relationship Notes</label>
                <button onClick={() => onLedgerChange("")} className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Clear</button>
              </div>
              <p className="text-[9px] text-muted-foreground/40 mb-2">
                How the child relates to the creature. Updated by the profile system.
              </p>
              <textarea
                value={creature.relationshipLedger}
                onChange={(e) => onLedgerChange(e.target.value)}
                placeholder="How does the child relate to Frog? Trusting, playful, opens up about feelings..."
                className="w-full h-28 rounded-lg border border-border/30 bg-card/50 px-3 py-2 text-xs text-foreground/90 resize-y focus:outline-none focus:border-[hsl(var(--creature-frog-glow))] transition-colors"
                spellCheck={false}
              />
            </div>

            {/* Last Session Summary */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Session Summary</label>
              <div className="mt-2 px-3 py-2.5 rounded-lg border border-border/20 text-[10px] text-foreground/60 whitespace-pre-wrap min-h-[40px]" style={{ background: "hsla(230, 14%, 12%, 0.8)" }}>
                {lastSessionSummary || "No session summary yet — will be populated after the next conversation."}
              </div>
            </div>

            {/* Word Cloud (secondary) */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Word Cloud</label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {topics.map((topic, i) => (
                  <span key={i} className="text-[10px] px-2 py-1 rounded-full border border-border/20 text-muted-foreground/60" style={{ background: "hsla(230, 14%, 15%, 0.8)" }}>{topic}</span>
                ))}
                {topics.length === 0 && <span className="text-[10px] text-muted-foreground/30">No topics yet</span>}
              </div>
            </div>
          </>
        )}

        {/* ═══ STATS TAB ═══ */}
        {tab === "stats" && (
          <>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Session</label>
              <p className="text-[10px] text-muted-foreground/40 mt-1 mb-3">Since last prompt/rules change</p>
              {sessionMetrics ? (
                <div className="grid grid-cols-2 gap-2">
                  <StatCard label="Messages" value={sessionMetrics.messageCount} />
                  <StatCard label="Est. Cost" value={sessionMetrics.cost} />
                  <StatCard label="Prompt Tokens" value={sessionMetrics.totalPrompt.toLocaleString()} />
                  <StatCard label="Completion Tokens" value={sessionMetrics.totalCompletion.toLocaleString()} />
                  <StatCard label="Avg User Msg" value={`${sessionMetrics.avgUserLen} chars`} />
                  <StatCard label="Avg Frog Msg" value={`${sessionMetrics.avgAssistantLen} chars`} />
                  <StatCard label="Avg Tokens/Response" value={sessionMetrics.avgTokensPerResponse} />
                  <StatCard label="Total Tokens" value={sessionMetrics.totalTokens.toLocaleString()} />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/40 text-center py-4">No messages in this session yet</p>
              )}

              {sessionMetrics && sessionMetrics.responseLengths.length > 1 && (
                <div className="mt-3">
                  <label className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Response Length Trend</label>
                  <div className="flex items-end gap-[2px] h-10 mt-1">
                    {sessionMetrics.responseLengths.map((len, i) => {
                      const max = Math.max(...sessionMetrics.responseLengths);
                      const h = max > 0 ? (len / max) * 100 : 0;
                      return (
                        <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, minHeight: 2, background: `hsl(var(--creature-frog-glow))`, opacity: 0.4 + (i / sessionMetrics.responseLengths.length) * 0.6 }} title={`${len} chars`} />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border/20" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Time</label>
                <button onClick={onResetAllTime} className="text-[10px] text-destructive/60 hover:text-destructive transition-colors">Reset</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="Total Messages" value={allTimeStats.totalMessages} />
                <StatCard label="Est. Chat Cost" value={estimateCost(allTimeStats.totalPromptTokens, allTimeStats.totalCompletionTokens)} />
                <StatCard label="Prompt Tokens" value={allTimeStats.totalPromptTokens.toLocaleString()} />
                <StatCard label="Completion Tokens" value={allTimeStats.totalCompletionTokens.toLocaleString()} />
                <StatCard label="Sessions" value={allTimeStats.sessions.length + 1} />
                <StatCard label="Total Tokens" value={allTimeStats.totalTokens.toLocaleString()} />
              </div>
            </div>

            {allTimeStats.memoryExtractionCalls > 0 && (
              <>
                <div className="border-t border-border/20" />
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Memory / Profile Updates</label>
                  <div className="grid grid-cols-2 gap-2">
                    <StatCard label="Updates" value={allTimeStats.memoryExtractionCalls} />
                    <StatCard label="Tokens Used" value={allTimeStats.memoryExtractionTokens.toLocaleString()} />
                    <StatCard label="Est. Cost" value={estimateMemoryCost(allTimeStats.memoryExtractionTokens)} />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border/20">
        <p className="text-[9px] text-muted-foreground/30 text-center">
          Ctrl+Shift+X to toggle · Changes apply on next message
        </p>
      </div>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-3 py-2 rounded-lg border border-border/20" style={{ background: "hsla(230, 14%, 12%, 0.8)" }}>
      <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-foreground/80 mt-0.5">{String(value)}</p>
    </div>
  );
}

function SectionEditor({ label, value, onChange, onReset, rows = 5, note }: {
  label: string; value: string; onChange: (v: string) => void;
  onReset?: () => void; rows?: number; note?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
        {onReset && (
          <button onClick={onReset} className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">Reset</button>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border/30 bg-card/50 px-3 py-2 text-xs text-foreground/90 resize-y focus:outline-none focus:border-[hsl(var(--creature-frog-glow))] transition-colors"
        rows={rows}
        spellCheck={false}
      />
      {note && <p className="text-[9px] text-muted-foreground/40 mt-1">{note}</p>}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-foreground/70">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors relative ${checked ? "bg-[hsl(var(--creature-frog))]" : "bg-border/40"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground/90 transition-transform ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function ThreadEditor({ thread, onChange, onRemove }: {
  thread: any;
  onChange: (updated: any) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-lg border border-border/20 overflow-hidden" style={{ background: "hsla(230, 14%, 12%, 0.8)" }}>
      <div className="flex items-center gap-2 px-3 py-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {expanded ? <ChevronDown size={12} className="text-muted-foreground/50" /> : <ChevronRight size={12} className="text-muted-foreground/50" />}
        <span className="text-[11px] text-foreground/80 font-medium flex-1">{thread.title || "Untitled"}</span>
        {thread.resolved && <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted-foreground/20 text-muted-foreground/50">Resolved</span>}
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-muted-foreground/30 hover:text-destructive/60 transition-colors">
          <Trash2 size={11} />
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <input
            value={thread.title || ""}
            onChange={(e) => onChange({ ...thread, title: e.target.value })}
            className="w-full px-2 py-1 rounded border border-border/20 bg-card/30 text-[10px] text-foreground/80 focus:outline-none"
            placeholder="Thread title"
          />
          <div>
            <p className="text-[9px] text-muted-foreground/50 mb-1">Current State</p>
            <textarea
              value={thread.current_state || ""}
              onChange={(e) => onChange({ ...thread, current_state: e.target.value })}
              className="w-full h-16 rounded border border-border/20 bg-card/30 px-2 py-1 text-[10px] text-foreground/80 resize-y focus:outline-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[9px] text-muted-foreground/50">Developments ({(thread.developments || []).length})</p>
              <button
                onClick={() => onChange({ ...thread, developments: [...(thread.developments || []), ""] })}
                className="text-[9px] text-[hsl(var(--creature-frog-glow))]/60 hover:text-[hsl(var(--creature-frog-glow))] transition-colors flex items-center gap-0.5"
              >
                <Plus size={9} /> Add
              </button>
            </div>
            {(thread.developments || []).map((dev: string, di: number) => (
              <div key={di} className="flex gap-1 mb-1">
                <span className="text-[9px] text-muted-foreground/30 mt-1 w-4 shrink-0">{di + 1}.</span>
                <textarea
                  value={dev}
                  onChange={(e) => {
                    const newDevs = [...(thread.developments || [])];
                    newDevs[di] = e.target.value;
                    onChange({ ...thread, developments: newDevs });
                  }}
                  className="flex-1 h-12 rounded border border-border/20 bg-card/30 px-2 py-1 text-[10px] text-foreground/80 resize-y focus:outline-none"
                />
                <button
                  onClick={() => {
                    const newDevs = (thread.developments || []).filter((_: any, i: number) => i !== di);
                    onChange({ ...thread, developments: newDevs });
                  }}
                  className="text-muted-foreground/20 hover:text-destructive/60 transition-colors mt-1"
                >
                  <Trash2 size={9} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <ToggleRow
              label="Child involved"
              checked={thread.child_involved || false}
              onChange={(v) => onChange({ ...thread, child_involved: v })}
            />
          </div>
          {thread.child_involved && (
            <input
              value={thread.child_advice || ""}
              onChange={(e) => onChange({ ...thread, child_advice: e.target.value })}
              className="w-full px-2 py-1 rounded border border-border/20 bg-card/30 text-[10px] text-foreground/80 focus:outline-none"
              placeholder="Child's advice..."
            />
          )}
          <ToggleRow
            label="Resolved"
            checked={thread.resolved || false}
            onChange={(v) => onChange({ ...thread, resolved: v })}
          />
        </div>
      )}
    </div>
  );
}

function OrchestratorDebug({ meta, compact }: { meta: OrchestratorMeta; compact?: boolean }) {
  const intentColor = INTENT_COLORS[meta.intent] || "hsl(200, 50%, 50%)";
  const toneEmoji = TONE_EMOJI[meta.emotional_tone] || "❓";

  return (
    <div className={`mt-2 px-3 py-2 rounded-lg border border-border/20 space-y-1.5 ${compact ? "py-1.5" : ""}`} style={{ background: "hsla(230, 14%, 12%, 0.8)" }}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${intentColor}25`, color: intentColor, border: `1px solid ${intentColor}40` }}>
          {meta.intent}
        </span>
        <span className="text-[11px]" title={meta.emotional_tone}>{toneEmoji}</span>
        {meta.safety_flagged && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">⚠ flagged</span>
        )}
        {!meta.response_validation.passed && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">⚠ validation</span>
        )}
      </div>

      {!compact && (
        <>
          {meta.context_sections_used.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {meta.context_sections_used.map((s) => (
                <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-border/20 text-muted-foreground/50">{s}</span>
              ))}
              <span className="text-[9px] text-muted-foreground/30 ml-1">~{meta.context_token_estimate} tokens</span>
            </div>
          )}

          {meta.response_validation.flags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {meta.response_validation.flags.map((f, i) => (
                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400/70">{f}</span>
              ))}
            </div>
          )}

          {meta.memory_candidate && meta.memory_text && (
            <p className="text-[10px] text-[hsl(var(--creature-frog-glow))]/70">💾 {meta.memory_text}</p>
          )}
        </>
      )}
    </div>
  );
}

export default ConfigPanel;
