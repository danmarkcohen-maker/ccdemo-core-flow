import React, { useState, useMemo } from "react";
import type { ChatMessage } from "@/components/craiture/screens/ChatScreen";
import type { SessionStats, AllTimeStats } from "@/hooks/useConfigPanel";
import { X } from "lucide-react";

const fontStyle = { fontFamily: "'SF Pro Rounded', -apple-system, sans-serif" };

type Tab = "prompt" | "memory" | "stats";

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
}

// Memory extraction patterns
const MEMORY_PATTERNS: { label: string; patterns: RegExp[] }[] = [
  { label: "Name", patterns: [/my name is (\w+)/i, /i'm (\w+)/i, /call me (\w+)/i] },
  { label: "Age", patterns: [/i'm (\d+) years old/i, /i am (\d+)/i, /i'm (\d+)/i] },
  { label: "Likes", patterns: [/i like (.+?)(?:\.|!|$)/i, /i love (.+?)(?:\.|!|$)/i, /i enjoy (.+?)(?:\.|!|$)/i] },
  { label: "Favorite", patterns: [/my fav(?:ou?rite)? (.+?) is (.+?)(?:\.|!|$)/i, /my fav(?:ou?rite)? is (.+?)(?:\.|!|$)/i] },
  { label: "Dislikes", patterns: [/i (?:don't|dont|hate) like (.+?)(?:\.|!|$)/i, /i hate (.+?)(?:\.|!|$)/i] },
  { label: "Wants", patterns: [/i want to (.+?)(?:\.|!|$)/i, /i wish (.+?)(?:\.|!|$)/i] },
  { label: "Feels", patterns: [/i feel (.+?)(?:\.|!|$)/i, /i'm feeling (.+?)(?:\.|!|$)/i] },
];

function extractMemories(messages: ChatMessage[]): { label: string; value: string }[] {
  const memories: { label: string; value: string }[] = [];
  const seen = new Set<string>();

  for (const msg of messages) {
    if (!msg.isUser) continue;
    for (const { label, patterns } of MEMORY_PATTERNS) {
      for (const pattern of patterns) {
        const match = msg.message.match(pattern);
        if (match) {
          const value = (match[2] || match[1]).trim();
          const key = `${label}:${value.toLowerCase()}`;
          if (!seen.has(key) && value.length > 1 && value.length < 60) {
            seen.add(key);
            memories.push({ label, value });
          }
        }
      }
    }
  }
  return memories;
}

// Cost estimates (Gemini Flash approximate pricing)
const COST_PER_M_INPUT = 0.10;
const COST_PER_M_OUTPUT = 0.40;
function estimateCost(promptTokens: number, completionTokens: number): string {
  const cost = (promptTokens / 1_000_000) * COST_PER_M_INPUT + (completionTokens / 1_000_000) * COST_PER_M_OUTPUT;
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
}) => {
  const [tab, setTab] = useState<Tab>("prompt");
  const memories = useMemo(() => extractMemories(chatMessages), [chatMessages]);

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

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "prompt", label: "Prompt" },
    { id: "memory", label: "Memory" },
    { id: "stats", label: "Stats" },
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
            <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
              Changes apply on next message. System prompt + rules are combined and sent to the model.
              Changing either starts a new stats session for A/B comparison.
            </p>
          </>
        )}

        {tab === "memory" && (
          <>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Extracted Memories ({memories.length})
              </label>
              <p className="text-[10px] text-muted-foreground/40 mt-1 mb-3">
                Facts extracted from user messages. On a real device, these would persist in local storage.
              </p>
            </div>
            {memories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground/50">No memories extracted yet</p>
                <p className="text-[10px] text-muted-foreground/30 mt-1">
                  The child needs to share things like "I like dinosaurs" or "My name is Sam"
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {memories.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 px-3 py-2 rounded-lg border border-border/20"
                    style={{ background: "hsla(120, 20%, 15%, 0.3)" }}
                  >
                    <span className="text-[10px] font-bold text-[hsl(var(--creature-frog-glow))] uppercase shrink-0 mt-0.5 w-14">
                      {m.label}
                    </span>
                    <span className="text-xs text-foreground/80">{m.value}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Conversation Topics
              </label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {getTopics(chatMessages).map((topic, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-1 rounded-full border border-border/20 text-muted-foreground/60"
                    style={{ background: "hsla(230, 14%, 15%, 0.8)" }}
                  >
                    {topic}
                  </span>
                ))}
                {getTopics(chatMessages).length === 0 && (
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

              {/* Response length sparkline */}
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

            {/* Divider */}
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
                  label="Est. Total Cost"
                  value={estimateCost(allTimeStats.totalPromptTokens, allTimeStats.totalCompletionTokens)}
                />
                <StatCard label="Prompt Tokens" value={allTimeStats.totalPromptTokens.toLocaleString()} />
                <StatCard label="Completion Tokens" value={allTimeStats.totalCompletionTokens.toLocaleString()} />
                <StatCard label="Sessions" value={allTimeStats.sessions.length + 1} />
                <StatCard label="Total Tokens" value={allTimeStats.totalTokens.toLocaleString()} />
              </div>
            </div>
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

// Simple topic extraction from conversation
function getTopics(messages: ChatMessage[]): string[] {
  const topicWords = new Set<string>();
  const stopWords = new Set(["the", "a", "an", "is", "it", "i", "you", "we", "they", "my", "your", "do", "does", "did", "have", "has", "had", "was", "were", "be", "been", "am", "are", "what", "how", "why", "when", "where", "who", "that", "this", "and", "or", "but", "so", "if", "to", "of", "in", "on", "at", "for", "with", "about", "from", "up", "out", "not", "no", "yes", "can", "will", "would", "could", "should", "just", "like", "think", "know", "really", "very", "too", "also", "don't", "dont", "it's", "its", "i'm", "im", "kind", "actually", "pretty", "much"]);

  for (const msg of messages) {
    if (!msg.isUser) continue;
    const words = msg.message.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
    for (const w of words) {
      if (w.length > 3 && !stopWords.has(w)) {
        topicWords.add(w);
      }
    }
  }
  return Array.from(topicWords).slice(0, 15);
}

export default ConfigPanel;
