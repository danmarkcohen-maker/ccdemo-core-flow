

## How the Memory Extraction System Works

### The Flow

**1. After every Frog response completes** (line 120-124 in `ChatScreen.tsx`):
- The `onResponseComplete` callback is triggered
- It sends the full conversation history to the `extract-memories` edge function

**2. The edge function processes the conversation** (`supabase/functions/extract-memories/index.ts`):
- **Filters to user messages only** (lines 20-23) — ignores Frog's responses, only looks at what the child said
- Builds a condensed transcript of all the child's messages joined with newlines
- If there are no user messages, returns empty memories immediately

**3. LLM extraction using structured tool calling** (lines 36-92):
- Calls `google/gemini-2.5-flash-lite` via the Lovable AI gateway
- Uses OpenAI's **function calling / tool use** pattern to force structured JSON output
- The system prompt (line 32-34) tells the LLM to:
  - Extract ONLY what the child explicitly stated (no inference)
  - Ignore extracting the name (since it's already known from onboarding)
- The tool schema (lines 50-89) defines exactly what to extract:
  - **age**: number or null if not mentioned
  - **likes**: array of things they said they like/love/enjoy
  - **dislikes**: array of things they don't like/hate
  - **feelings**: current emotions they expressed
  - **topics**: main subjects discussed
- `tool_choice: { type: "function", function: { name: "store_memories" } }` forces the model to ALWAYS call this function (can't refuse or chat instead)

**4. Parsing the structured response** (lines 117-127):
- The LLM's response comes back as a `tool_call` with JSON in the `arguments` field
- This JSON is parsed and returned as structured memories
- Token usage is also captured for cost tracking

**5. Merging with existing memories** (lines 69-81 in `useConfigPanel.ts`):
- New memories are **merged** with existing ones, not replaced
- Likes, dislikes, topics: de-duplicated and accumulated over time (case-insensitive)
- Age: latest value wins
- Feelings: **replaced** each time (feelings are current state, not accumulated)
- All stored in localStorage for persistence

**6. Automatic injection into system prompt** (lines 180-195 in `useConfigPanel.ts`):
- The `buildCombinedPrompt` function creates a formatted memory block
- Appended to the system prompt before each message as:
  ```
  ## What you know about the child
  Name: Beth
  Likes: dinosaurs, dogs
  Dislikes: not listening
  Current feelings: problem
  Topics: ai, robot, friend chloe, friends
  ```
- This gives the Frog "memory" across the conversation

### Why This Fixes the Bug

The screenshot shows:
- **DISLIKES**: "not listening" ✓ correct (child said this)
- **FEELINGS**: "problem" ✓ correct (child expressed feeling a problem)
- **TOPICS**: "ai", "robot", "friend chloe", "friends" ✓ correct

The old regex system would have extracted "happy" as a name from "I'm happy". The new system:
- Ignores name extraction entirely (line 32: "do NOT extract the name")
- Uses the LLM to understand context — "I'm happy" is a feeling, not an identity
- Only extracts what the child **explicitly stated** in their own messages

### Cost Tracking

- Token usage from the extraction call is tracked separately (lines 222-228 in `useConfigPanel.ts`)
- Shown in Stats tab as "Memory extraction: X calls, Y tokens"
- Uses the cheapest/fastest model (`gemini-2.5-flash-lite`) to minimize cost
- Typical extraction: ~50-100 output tokens per call

