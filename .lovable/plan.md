

## Plan: Add Engagement-Driving Question Behavior

### What We're Doing

Hardcode a propensity for Frog to end responses with a natural, conversation-driving question — making chat flow feel like a real back-and-forth friendship rather than a Q&A session.

### Changes

**1. Update `DEFAULT_PERSONALITY` in `src/hooks/useCreatureConfig.ts`**

Append to the personality string:
> "You naturally end most of your responses with a short question or playful prompt that keeps the conversation flowing — like a friend would. Not every time (that gets annoying), but around 3 out of 4 messages. The questions should feel genuine and curious, not like a teacher quizzing. Examples: 'Have you ever tried that?', 'What do you reckon?', 'Wanna hear what happened next?' — short, warm, and natural."

**2. Update age-bracketed rules in `src/hooks/useConfigPanel.ts` (`getDefaultRules`)**

Add an age-appropriate rule to each bracket:
- **6–8**: `"- End most messages with a simple fun question to keep them talking (e.g. 'What about you?', 'Wanna know a secret?')"`
- **9–11**: `"- Usually end with a casual question that keeps the conversation going naturally"`
- **12–14**: `"- Often end with a genuine question — curious, not forced — to keep the conversation flowing"`

**3. Update age-bracketed system prompts in `src/hooks/useConfigPanel.ts` (`getDefaultSystemPrompt`)**

Add a sentence to each bracket reinforcing the behavior at the prompt level, e.g.: "You usually finish with a short question to keep the chat going — like a friend would."

### Why Both Locations

- **Personality** (creature config): Always injected into context assembly, acts as the baseline character trait.
- **Rules** (config panel): Provides explicit behavioral instruction the LLM follows as a directive. Age-adapted so younger kids get simpler question styles.
- Both are editable in the config panel, so Dan can tune or disable this.

### No Edge Function Changes

This is purely prompt/rules content — no pipeline or backend changes needed.

