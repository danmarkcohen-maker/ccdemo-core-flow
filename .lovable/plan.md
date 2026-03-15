

# Orchestrator & Story System — Implementation Plan

This is a large, multi-phase build. The brief is well-structured and the implementation order it suggests is sound. Here's the plan broken into concrete steps.

---

## Phase 1: Story Data Model & State

**New file:** `src/lib/storyTypes.ts` — TypeScript interfaces for `StoryArc`, `StoryBeat`, `StoryHook`, `StoryState` (as specified in the brief).

**New file:** `src/lib/defaultStoryArc.ts` — The "Lake Creature" arc with all 5 beats, hooks, clues, and advancement rules.

**New hook:** `src/hooks/useStoryState.ts` — Manages story runtime state in localStorage (`craiture_story_state`) and arc definitions (`craiture_story_arcs`). Exposes: `storyState`, `storyArcs`, `advanceBeat`, `rewindBeat`, `resetArc`, `forceHook`, `completeArc`, `updateArc`, `addArc`, `deleteArc`, `importArc`, `exportArc`. On first load, seeds the default Lake Creature arc if no arcs exist.

---

## Phase 2: Story Tab in Config Panel

**Modify:** `src/components/craiture/ConfigPanel.tsx`
- Add `"story"` to the tab type and tab bar
- New props: story state, story arcs, and control callbacks from the hook

**New components:**
- `src/components/craiture/config/StoryStateDisplay.tsx` — Live runtime view: active arc, current beat, cooldown bar (messages_since_last_hook visualized between min/max), hook attempts, known clues as pills, engagement history with color coding. Control buttons: Advance Beat, Rewind, Reset Arc, Force Hook, Complete Arc.
- `src/components/craiture/config/StoryArcEditor.tsx` — Arc selector dropdown + New Arc button. Arc settings fields (title, description, cooldowns, injection weight slider). Beat list with collapsible cards containing all editable fields (title, description, creature_knowledge, hooks with style/text/used, advancement type, clues, required clues). Add/delete beat, add/delete hook. Import/Export JSON buttons.

---

## Phase 3: Orchestrator Refactor of frog-chat

**Rewrite:** `supabase/functions/frog-chat/index.ts` — Transform from thin proxy to pipeline.

The edge function becomes ~300 lines with this structure:

```text
Request in (messages, systemPrompt, storyState, storyArcs)
  │
  ├─ Stage 1: Safety Gate
  │   ├─ Regex check (injection patterns, explicit content)
  │   └─ If ambiguous → Flash Lite classification call
  │   └─ If unsafe → return deflection + metadata, skip LLM
  │
  ├─ Stage 2: Intent Classification
  │   └─ Flash Lite call with last 3-4 messages → structured output
  │       (primary_intent, emotional_tone, story_engagement, memory_candidate)
  │
  ├─ Stage 3: Context Assembly
  │   ├─ Always: personality, child info, recent history, memories
  │   ├─ Conditional: homework helper, emotional support, story context
  │   └─ Story injection logic (cooldown check, hook selection, probabilistic injection)
  │
  ├─ Stage 4: Main LLM Call (Gemini Flash, streamed)
  │   └─ SSE response streamed back as-is
  │
  └─ Stage 5: Post-stream metadata event
      └─ Send final SSE: data: {"orchestrator": {..., "updated_story_state": {...}}}
```

The safety deflection responses are passed in from the frontend (stored in config) so they can be authored. The orchestrator picks one randomly.

**Key detail:** Stages 1 and 2 (safety + intent) are sequential pre-LLM calls using Flash Lite. They add ~200-400ms latency but are essential. Stage 3 is pure logic (no LLM call). Stage 4 streams. Stage 5 appends metadata after `[DONE]`.

---

## Phase 4: Frontend Integration

**Modify:** `src/lib/streamFrogChat.ts`
- Add `storyState` and `storyArcs` to the request body
- Parse the post-DONE orchestrator metadata SSE event
- New callback: `onOrchestratorMeta?: (meta: OrchestratorMeta) => void`

**Modify:** `src/components/craiture/screens/ChatScreen.tsx`
- Pass storyState and storyArcs through streamFrogChat
- Handle orchestrator metadata: update story state, trigger memory extraction if flagged

**Modify:** `src/pages/DeviceExperience.tsx`
- Wire `useStoryState` hook
- Pass story state/arcs to ChatScreen and ConfigPanel
- Handle story state updates from orchestrator metadata
- Clear story state on hard reset

---

## Phase 5: Orchestrator Debug Display

**New component:** `src/components/craiture/config/OrchestratorLog.tsx`
- Shows last 10 orchestrator decisions (scrollable, newest first)
- Each entry: intent, tone, story engagement, safety flag, context sections used, story hook attempted

Add to ConfigPanel as a section within the Prompt tab or a new "Orchestrator" tab (the brief suggests either; a new tab keeps things clean).

**Modify ConfigPanel Prompt tab:**
- Safety gate toggle
- Intent classification toggle
- Safety deflections textarea (one per line)

---

## Phase 6: Enhanced Memory

**Modify:** `src/components/craiture/ConfigPanel.tsx` Memory tab
- Add "Story Discoveries" section with amber/gold colored pills for known clues

**Modify:** `supabase/functions/extract-memories/index.ts`
- Add `story_observations` field to extraction schema
- Update prompt to look for story-related discoveries

---

## Files Changed Summary

| File | Action |
|------|--------|
| `src/lib/storyTypes.ts` | Create |
| `src/lib/defaultStoryArc.ts` | Create |
| `src/hooks/useStoryState.ts` | Create |
| `src/components/craiture/config/StoryStateDisplay.tsx` | Create |
| `src/components/craiture/config/StoryArcEditor.tsx` | Create |
| `src/components/craiture/config/OrchestratorLog.tsx` | Create |
| `supabase/functions/frog-chat/index.ts` | Rewrite |
| `supabase/functions/extract-memories/index.ts` | Modify |
| `src/lib/streamFrogChat.ts` | Modify |
| `src/components/craiture/screens/ChatScreen.tsx` | Modify |
| `src/components/craiture/ConfigPanel.tsx` | Modify (new tabs, new props) |
| `src/hooks/useConfigPanel.ts` | Modify (deflections, orchestrator toggles) |
| `src/pages/DeviceExperience.tsx` | Modify (wire story state) |
| `supabase/config.toml` | No change needed (frog-chat already has verify_jwt = false) |

---

## What stays untouched

DeviceFrame, OnboardingScreen, ChatBubble, ChatInput, ThinkingDots, Fireflies, creature components, multiplayer screens, sleep overlay, simulate buttons, generate-opener function — all preserved exactly as-is.

---

## Risk & Complexity Notes

- **Latency**: Two pre-LLM calls (safety + intent) add ~300-500ms before streaming starts. Both use Flash Lite which is fast, but it's noticeable. We can optimize later by running them in parallel (safety doesn't depend on intent).
- **Edge function size**: The orchestrator will be ~300-400 lines in a single index.ts. This is within limits but approaching the upper bound of maintainability for a single file.
- **Story state consistency**: Story state travels round-trip (frontend → edge function → frontend). If a request fails mid-stream, state could desync. We'll use the metadata event approach — state only updates when the full response completes successfully.

This is a 6-phase build. I'd implement phases 1-2 first (data model + UI) so you can see and author stories immediately, then phases 3-6 (orchestrator + wiring) to make them come alive.

