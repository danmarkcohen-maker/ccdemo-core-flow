

## Problem

The screenshot shows the bug clearly: the child typed "I'm happy" and the regex `/i'm (\w+)/i` matched it as a Name extraction, storing "happy" as the child's name. This pattern will false-positive on any "I'm [adjective]" statement — which children say constantly.

The child's name is **already known** — it's captured during onboarding and stored as `userName` in `DeviceExperience.tsx` (currently "Beth" by default, overridden via `handleOnboardingComplete`). The regex-based extraction is both redundant for name and unreliable for everything else.

## Plan

**1. Pass `userName` into ConfigPanel as a prop**
- Add `userName: string` to `ConfigPanelProps`
- Display it as a fixed "Name" entry in the Memory tab (not extracted, just known)

**2. Replace regex memory extraction with LLM-based extraction**
- After each Frog response completes, make a lightweight second call to the edge function with a specialized prompt: "Extract structured facts from this conversation. Return JSON: `{name, age, likes, dislikes, feelings, topics}`"
- Use `gemini-2.5-flash-lite` (cheapest/fastest) for this — it's a metadata task, not a conversation
- Store extracted memories in localStorage, accumulating across sessions
- Show cost of memory extraction separately in Stats tab

**3. Update the Memory tab UI**
- Show `userName` as a permanent, non-extracted field at the top
- Show LLM-extracted facts below, grouped by category
- Add a "Re-extract" button to force a fresh extraction from full history
- Keep the conversation topics word cloud (it's useful) but filter out stopwords

**4. Inject memories into the system prompt**
- Append known memories to the system prompt automatically: "You know the following about the child: Name: Beth, Likes: dinosaurs, dogs..."
- This closes the loop shown in the screenshot — Frog said "I don't think you've told me your name" because it had no memory, even though the name was captured at onboarding

### New edge function: `supabase/functions/extract-memories/index.ts`
- Accepts conversation history, returns structured JSON
- Uses `gemini-2.5-flash-lite` with a strict extraction prompt
- Lightweight, ~50-100 tokens output

### File changes
- `ConfigPanel.tsx` — add `userName` prop, replace `extractMemories` with stored memories display, add re-extract button
- `useConfigPanel.ts` — add memories state (localStorage-backed), add `extractMemories` async function, auto-inject memories into system prompt
- `DeviceExperience.tsx` — pass `userName` to ConfigPanel, pass memories to prompt builder
- `ChatScreen.tsx` — trigger memory extraction after each completed response

