

# Fix: Story-Aware Intent Classifier + Post-Response Validation

Two targeted improvements to the orchestrator pipeline.

---

## 1. Story-Aware Intent Classification

**Problem:** `classifyIntent()` (line 103) only sees the last 4 messages. It has no idea what story beat is active or what hook was just attempted, so it can misclassify unrelated curiosity as `story_engagement`.

**Fix:** Pass current beat info and last hook text into the classifier prompt.

**Changes to `supabase/functions/frog-chat/index.ts`:**

- Modify `classifyIntent()` signature to accept optional story context: `{ currentBeatTitle, lastHookText, knownClues }`.
- Inject this into the classifier system prompt:
  ```
  ## Active Story Context
  Current story beat: "{title}"
  Last story hook the creature mentioned: "{hookText}"
  The child already knows these clues: [...]
  
  Use this context to determine story_engagement accurately.
  Only classify as "curious" or "actively_exploring" if the child is
  responding to the story hook above, not just asking about something
  unrelated.
  ```
- At the call site (~line 443), extract current beat/hook info from `storyState` + `storyArcs` before calling `classifyIntent()`.

---

## 2. Post-Response Validation Stage

**Problem:** No validation of the LLM response before it reaches the child. The response streams straight through — could be too long, break character, or contain unsafe content.

**Fix:** Add a lightweight post-stream validation step. Since the response is already streamed (can't un-send it), this stage operates as a **monitor and flag** system rather than a blocker. It logs issues in the orchestrator metadata so the config panel shows warnings.

For the prototype, this is metadata-only (no re-generation). The validation runs after the full response is collected.

**Changes to `supabase/functions/frog-chat/index.ts`:**

- Collect the full response text while streaming (accumulate deltas in a buffer alongside forwarding them).
- After the stream completes, before appending orchestrator metadata:
  - **Length check**: Flag if response exceeds ~200 words (creature should be terse).
  - **Character break check**: Simple regex for phrases a child's creature wouldn't say ("As an AI", "I'm a language model", "I cannot", "I don't have feelings").
  - **Safety re-check**: Run the same `UNSAFE_PATTERNS` regex on the response text.
- Add validation results to orchestrator metadata:
  ```json
  {
    "orchestrator": {
      ...existing fields...,
      "response_validation": {
        "passed": true/false,
        "flags": ["too_long", "character_break", "unsafe_content"]
      }
    }
  }
  ```
- Update `OrchestratorMeta` type in `src/lib/storyTypes.ts` to include `response_validation`.
- Show validation flags in `OrchestratorLog.tsx` with warning colors.

**Streaming architecture note:** To collect the response text, the `ReadableStream` in lines 538-556 will buffer content chunks. Each SSE `data:` line from the upstream is parsed for `choices[0].delta.content`, accumulated into a string, AND forwarded to the client simultaneously. The validation runs after the upstream stream ends, before the metadata event is appended.

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/frog-chat/index.ts` | Add story context to classifier, add response validation stage |
| `src/lib/storyTypes.ts` | Add `response_validation` to `OrchestratorMeta` |
| `src/components/craiture/config/OrchestratorLog.tsx` | Show validation flags |

