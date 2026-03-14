

## Plan: Hidden Configuration & Diagnostics Panel

### What We're Building

A hidden debug panel accessible via keyboard shortcut (`Ctrl+Shift+D`) that slides out from the right side of the screen. The main prototype UI stays completely untouched. The panel provides:

1. **System Prompt Editor** — editable textarea, live-applied on next message
2. **Personality & Rules Editor** — separate field appended to system prompt as behavioral constraints
3. **Memory Viewer** — shows extracted "facts" the Frog has learned about the child (name, interests, topics discussed)
4. **Session Diagnostics** — token usage, message counts, avg response length, cost estimates, tracked per-session (since last prompt change) and cumulative

### Architecture

```text
DeviceExperience
├── Device + Chat (unchanged)
└── ConfigPanel (slide-out, z-60)
      ├── Prompt Tab: system prompt + personality rules textareas
      ├── Memory Tab: list of extracted facts from conversation
      └── Stats Tab: token/message/cost metrics with session vs all-time toggle
```

**No database needed** — all state is client-side (localStorage for persistence across reloads, React state for live updates). This is a prototype tuning tool, not a production feature.

### Implementation Steps

**1. Update edge function to accept dynamic system prompt**
- Accept optional `systemPrompt` field in request body
- Fall back to hardcoded default if not provided
- Redeploy

**2. Update `streamFrogChat.ts` to capture token usage and accept custom prompt**
- Add `systemPrompt` param forwarded to edge function
- Parse the final SSE chunk's `usage` field (`prompt_tokens`, `completion_tokens`, `total_tokens`)
- Add `onUsage` callback to return token counts

**3. Create `src/components/craiture/ConfigPanel.tsx`**
- Three tabs: Prompt, Memory, Stats
- **Prompt tab**: Two textareas — "System Prompt" (the core identity) and "Rules" (behavioral constraints like max length, emoji policy, vocabulary level). Both saved to localStorage.
- **Memory tab**: Scans conversation history for facts about the child (simple keyword extraction: name, age mentions, interests, favorites). Displays as a list of "memories" the Frog would have on-device.
- **Stats tab**: 
  - Per-session (since last prompt change): message count, avg tokens per response, total tokens, estimated cost, avg user message length, avg Frog response length
  - All-time (cumulative): same metrics across all sessions
  - Session boundary marker when prompt changes
  - Simple bar/sparkline showing response lengths over time to spot quality drift

**4. Create `src/hooks/useConfigPanel.ts`**
- Manages panel open/close state via `Ctrl+Shift+D`
- Stores/retrieves system prompt and rules from localStorage
- Tracks stats: accumulates token usage per message, stores session snapshots
- Exposes `currentSystemPrompt` for ChatScreen to pass through

**5. Wire into `DeviceExperience.tsx`**
- Add the hook and panel component
- Pass `currentSystemPrompt` down to ChatScreen
- Pass stats callbacks through to the streaming call
- Panel renders alongside existing layout, no changes to device/chat DOM structure

### Technical Details

- Token usage comes from the OpenAI-compatible `usage` field in the final SSE chunk (supported by the Lovable AI gateway)
- Memory extraction is heuristic — pattern matching for "I like", "my favorite", "I'm [age]", "my name is" etc. Good enough for a prototype tuning tool
- Stats reset on prompt change creates natural A/B comparison: change the prompt, chat for a while, compare metrics to previous session
- Cost estimate uses approximate pricing for Gemini Flash (~$0.10/1M input, $0.40/1M output tokens)
- The panel uses the same dark UI aesthetic as the existing simulate buttons but is more expansive

