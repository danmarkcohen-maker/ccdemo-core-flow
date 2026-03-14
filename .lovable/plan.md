

## Plan: Wire Frog Chat to Lovable AI (Simulating Qwen3 4B)

### What We're Building

Replace the scripted Frog response in single-player chat with a live LLM call via Lovable AI gateway. The system prompt will instruct the model to behave like a small on-device model (Qwen3 4B on 8GB RAM) — short responses, child-friendly, slightly quirky personality, occasional "processing" pauses.

Streaming will render token-by-token in the existing ChatBubble component.

### Architecture

```text
ChatScreen → fetch(edge function URL) → Edge Function → Lovable AI Gateway (gemini-3-flash-preview)
                                                              ↓
                                              System prompt constrains behavior
                                              to simulate Qwen3 4B characteristics
```

### Implementation Steps

**1. Create edge function `supabase/functions/frog-chat/index.ts`**
- CORS headers, streaming SSE passthrough
- System prompt: "You are Frog, a small AI creature companion running on a child's handheld device. You speak in short, playful sentences. You love ribbit puns. You're curious, encouraging, and gentle. Keep responses under 2-3 sentences — you're a tiny 4B parameter model with limited memory. Use emojis sparingly. Never be scary or negative. The child's name is provided in conversation. End messages with a frog emoji occasionally."
- Model: `google/gemini-3-flash-preview`
- Stream: true
- Handle 429/402 errors

**2. Update `supabase/config.toml`**
- Add `[functions.frog-chat]` with `verify_jwt = false`

**3. Create `src/lib/streamFrogChat.ts`**
- SSE streaming helper using the pattern from the knowledge file
- Takes conversation history, returns `onDelta`/`onDone` callbacks
- Converts `ChatMessage[]` to OpenAI-format `{role, content}[]`

**4. Update `ChatScreen.tsx`**
- Replace the scripted `handleSend` with async streaming logic
- On user send: append user message, show thinking dots, call `streamFrogChat`
- On first delta: hide thinking dots, start building assistant message token-by-token
- On done: mark message complete, stop speaking animation
- The ChatBubble already handles streaming text display, but we'll need to update it slightly — instead of the character-by-character animation (which re-animates a known string), we'll directly set the growing text as it arrives from the stream

**5. Update `ChatBubble.tsx`**
- Add a `liveStream` prop that bypasses the character-by-character interval animation — when true, `message` is the live-updating content and we just render it directly with the cursor

### Technical Details

- `LOVABLE_API_KEY` is already provisioned
- Conversation history: send last ~10 messages to keep context manageable (simulates 4B model's limited context window)
- The existing `streaming` prop on ChatBubble does char-by-char animation of a known string. For live LLM streaming, we need a different mode where the component just renders whatever `message` currently contains plus a cursor while streaming is active.

