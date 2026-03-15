import React, { useState, useMemo } from "react";
import type { ChatMessage } from "@/components/craiture/screens/ChatScreen";
import type { SessionStats, AllTimeStats, ExtractedMemories } from "@/hooks/useConfigPanel";
import type { StoryState, StoryArc, OrchestratorMeta } from "@/lib/storyTypes";
import { X, RefreshCw } from "lucide-react";
import StoryStateDisplay from "@/components/craiture/config/StoryStateDisplay";
import StoryArcEditor from "@/components/craiture/config/StoryArcEditor";
import OrchestratorLog from "@/components/craiture/config/OrchestratorLog";

const fontStyle = { fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" };

type Tab = "prompt" | "memory" | "stats" | "story" | "orchestrator";

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
  // Story props
  storyState: StoryState;
  storyArcs: StoryArc[];
  onAdvanceBeat: () => void;
  onRewindBeat: () => void;
  onResetArc: () => void;
  onForceHook: () => void;
  onCompleteArc: () => void;
  onUpdateArc: (arc: StoryArc) => void;
  onAddArc: (arc: StoryArc) => void;
  onDeleteArc: (id: string) => void;
  onImportArc: (json: string) => boolean;
  onExportArc: (id: string) => string | null;
  // Orchestrator props
  orchestratorLog: OrchestratorMeta[];
  safetyGateEnabled: boolean;
  onSafetyGateToggle: (v: boolean) => void;
  intentClassificationEnabled: boolean;
  onIntentClassificationToggle: (v: boolean) => void;
  safetyDeflections: string;
  onSafetyDeflectionsChange: (v: string) => void;
}

// Cost estimates (Gemini Flash approximate pricing)
const COST_PER_M_INPUT = 0.10;
const COST_PER_M_OUTPUT = 0.40;
// Flash Lite pricing for memory extraction
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

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  isOpen,
  onClose,
  systemPrompt,
  onSystemPromptChange,
  rules,
  onRulesChange,
  defaultPrompt,
  defaultRules,
  chatMessages,
  sessionStats,
  allTimeStats,
  onResetAllTime,
  userName,
  memories,
  isExtracting,
  onReExtract,
  onClearMemories,
  storyState,
  storyArcs,
  onAdvanceBeat,
  onRewindBeat,
  onResetArc,
  onForceHook,
  onCompleteArc,
  onUpdateArc,
  onAddArc,
  onDeleteArc,
  onImportArc,
  onExportArc,
  orchestratorLog,
  safetyGateEnabled,
  onSafetyGateToggle,
  intentClassificationEnabled,
  onIntentClassificationToggle,
  safetyDeflections,
  onSafetyDeflectionsChange,
}) => {
  const [tab, setTab] = useState<Tab>("prompt");

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
      messageCount: msgs.length,
      totalPrompt,
      totalCompletion,
      totalTokens,
      avgUserLen: Math.round(avgUserLen),
      avgAssistantLen: Math.round(avgAssistantLen),
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
        if (w.length > 3 && !stopWords.has(w)) {
          topicWords.add(w);
        }
      }
    }
    return Array.from(topicWords).slice(0, 15);
  }, [chatMessages]);

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "prompt", label: "Prompt" },
    { id: "memory", label: "Memory" },
    { id: "stats", label: "Stats" },
    { id: "story", label: "Story" },
    { id: "orchestrator", label: "Orch" },
  ];

  const memoryCategories: { label: string; items: string[]; color: string }[] = [
    { label: "Likes", items: memories.likes, color: "hsl(var(--creature-frog-glow))" },
    { label: "Dislikes", items: memories.dislikes, color: "hsl(0, 60%, 60%)" },
    { label: "Feelings", items: memories.feelings, color: "hsl(280, 60%, 65%)" },
    { label: "Topics", items: memories.topics, color: "hsl(200, 60%, 60%)" },
  ];

  return (
    <div
      className="fixed top-0 right-0 h-full z-[60] flex flex-col border-l border-border/40"
      style={{ width: 420, background: "hsl(230, 18%, 7%)", ...fontStyle }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
        {tab === "prompt" && (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Prompt</label>
                <button
                  onClick={() => onSystemPromptChange(defaultPrompt)}
                  className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  Reset
                </button>
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
                <button
                  onClick={() => onRulesChange(defaultRules)}
                  className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  Reset
                </button>
              </div>
              <textarea
                value={rules}
                onChange={(e) => onRulesChange(e.target.value)}
                className="w-full h-36 rounded-lg border border-border/30 bg-card/50 px-3 py-2 text-xs text-foreground/90 resize-y focus:outline-none focus:border-[hsl(var(--creature-frog-glow))] transition-colors"
                spellCheck={false}
              />
            </div>

            {/* Orchestrator settings in Prompt tab */}
            <div className="border-t border-border/20 pt-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                Orchestrator Settings
              </label>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-[10px] text-foreground/70">Safety Gate</span>
                  <input
                    type="checkbox"
                    checked={safetyGateEnabled}
                    onChange={(e) => onSafetyGateToggle(e.target.checked)}
                    className="accent-[hsl(var(--creature-frog-glow))]"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-[10px] text-foreground/70">Intent Classification</span>
                  <input
                    type="checkbox"
                    checked={intentClassificationEnabled}
                    onChange={(e) => onIntentClassificationToggle(e.target.checked)}
                    className="accent-[hsl(var(--creature-frog-glow))]"
                  />
                </label>
                <div>
                  <label className="text-[10px] text-muted-foreground/50 block mb-1">Safety Deflections (one per line)</label>
                  <textarea
                    value={safetyDeflections}
                    onChange={(e) => onSafetyDeflectionsChange(e.target.value)}
                    className="w-full h-20 rounded-lg border border-border/30 bg-card/50 px-3 py-2 text-[10px] text-foreground/70 resize-y focus:outline-none focus:border-[hsl(var(--creature-frog-glow))]"
                    placeholder="Hmm, my brain went all foggy for a second there. What were we talking about? 🐸"
                  />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
              Changes apply on next message. System prompt + rules + memories are combined and sent to the model.
              Changing prompt/rules starts a new stats session for A/B comparison.
            </p>
          </>
        )}

        {tab === "memory" && (
          <>
            {/* Fixed known name */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Known Identity
              </label>
              <div
                className="mt-2 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[hsl(var(--creature-frog))]/30"
                style={{ background: "hsla(120, 20%, 15%, 0.4)" }}
              >
                <span className="text-[10px] font-bold text-[hsl(var(--creature-frog-glow))] uppercase shrink-0 w-14">
                  Name
                </span>
                <span className="text-xs text-foreground/90 font-medium">{userName}</span>
                <span className="text-[9px] text-muted-foreground/40 ml-auto">from onboarding</span>
              </div>
              {memories.age !== null && (
                <div
                  className="mt-1.5 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[hsl(var(--creature-frog))]/30"
                  style={{ background: "hsla(120, 20%, 15%, 0.4)" }}
                >
                  <span className="text-[10px] font-bold text-[hsl(var(--creature-frog-glow))] uppercase shrink-0 w-14">
                    Age
                  </span>
                  <span className="text-xs text-foreground/90 font-medium">{memories.age}</span>
                  <span className="text-[9px] text-muted-foreground/40 ml-auto">extracted</span>
                </div>
              )}
            </div>

            {/* LLM-extracted memories by category */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Extracted Memories
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClearMemories}
                    className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={onReExtract}
                    disabled={isExtracting}
                    className="flex items-center gap-1 text-[10px] text-[hsl(var(--creature-frog-glow))]/70 hover:text-[hsl(var(--creature-frog-glow))] transition-colors disabled:opacity-40"
                  >
                    <RefreshCw size={10} className={isExtracting ? "animate-spin" : ""} />
                    {isExtracting ? "Extracting…" : "Re-extract"}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/40 mb-3">
                Facts extracted via LLM after each response. Accumulated across sessions.
              </p>

              {memoryCategories.map((cat) => (
                <div key={cat.label} className="mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: cat.color }}>
                    {cat.label}
                  </p>
                  {cat.items.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground/30 pl-1">None yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((item, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-1 rounded-full border text-foreground/70"
                          style={{
                            borderColor: `${cat.color}33`,
                            background: `${cat.color}15`,
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Story Discoveries */}
            {storyState.known_clues.length > 0 && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "hsl(35, 60%, 60%)" }}>
                  Story Discoveries
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {storyState.known_clues.map((clue, i) => (
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
                  ))}
                </div>
              </div>
            )}

            {/* Conversation topics word cloud */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Word Cloud
              </label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {topics.map((topic, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-1 rounded-full border border-border/20 text-muted-foreground/60"
                    style={{ background: "hsla(230, 14%, 15%, 0.8)" }}
                  >
                    {topic}
                  </span>
                ))}
                {topics.length === 0 && (
                  <span className="text-[10px] text-muted-foreground/30">No topics yet</span>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "stats" && (
          <>
            {/* Session stats */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Current Session
              </label>
              <p className="text-[10px] text-muted-foreground/40 mt-1 mb-3">
                Since last prompt/rules change
              </p>
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
                  <label className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
                    Response Length Trend
                  </label>
                  <div className="flex items-end gap-[2px] h-10 mt-1">
                    {sessionMetrics.responseLengths.map((len, i) => {
                      const max = Math.max(...sessionMetrics.responseLengths);
                      const h = max > 0 ? (len / max) * 100 : 0;
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm"
                          style={{
                            height: `${h}%`,
                            minHeight: 2,
                            background: `hsl(var(--creature-frog-glow))`,
                            opacity: 0.4 + (i / sessionMetrics.responseLengths.length) * 0.6,
                          }}
                          title={`${len} chars`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border/20" />

            {/* All-time stats */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  All Time
                </label>
                <button
                  onClick={onResetAllTime}
                  className="text-[10px] text-destructive/60 hover:text-destructive transition-colors"
                >
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="Total Messages" value={allTimeStats.totalMessages} />
                <StatCard
                  label="Est. Chat Cost"
                  value={estimateCost(allTimeStats.totalPromptTokens, allTimeStats.totalCompletionTokens)}
                />
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
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                    Memory Extraction
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <StatCard label="Extractions" value={allTimeStats.memoryExtractionCalls} />
                    <StatCard label="Tokens Used" value={allTimeStats.memoryExtractionTokens.toLocaleString()} />
                    <StatCard label="Est. Cost" value={estimateMemoryCost(allTimeStats.memoryExtractionTokens)} />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {tab === "story" && (
          <>
            <StoryStateDisplay
              storyState={storyState}
              storyArcs={storyArcs}
              onAdvanceBeat={onAdvanceBeat}
              onRewindBeat={onRewindBeat}
              onResetArc={onResetArc}
              onForceHook={onForceHook}
              onCompleteArc={onCompleteArc}
            />

            <div className="border-t border-border/20 pt-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                Arc Editor
              </label>
              <StoryArcEditor
                storyArcs={storyArcs}
                onUpdateArc={onUpdateArc}
                onAddArc={onAddArc}
                onDeleteArc={onDeleteArc}
                onImportArc={onImportArc}
                onExportArc={onExportArc}
              />
            </div>
          </>
        )}

        {tab === "orchestrator" && (
          <OrchestratorLog entries={orchestratorLog} />
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

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="px-3 py-2 rounded-lg border border-border/20"
      style={{ background: "hsla(230, 14%, 12%, 0.8)" }}
    >
      <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-foreground/80 mt-0.5">{String(value)}</p>
    </div>
  );
}

export default ConfigPanel;
