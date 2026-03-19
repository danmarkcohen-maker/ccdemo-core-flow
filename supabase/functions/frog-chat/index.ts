import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// ─── Safety Patterns ─────────────────────────────────────────────────

const INJECTION_PATTERNS = [
  /ignore\s+(your|all|previous)\s+(instructions|rules|prompt)/i,
  /you\s+are\s+now/i,
  /system\s*prompt/i,
  /pretend\s+(you're|you\s+are|to\s+be)/i,
  /forget\s+(everything|your|all)/i,
  /override\s+(your|the)/i,
  /reveal\s+(your|the)\s+(system|instructions|prompt)/i,
  /jailbreak/i,
];

const UNSAFE_PATTERNS = [
  /\b(kill|murder|suicide|self[- ]harm)\b/i,
  /\b(sex|porn|nude|naked)\b/i,
];

const CHARACTER_BREAK_PATTERNS = [
  /as an ai/i,
  /i'm a language model/i,
  /i cannot/i,
  /i'm not able to/i,
  /as a large language/i,
];

const DEFAULT_SYSTEM_PROMPT = `You are Frog, a small AI creature companion running on a child's handheld device powered by a tiny 4B parameter model. You speak in short, playful sentences (2-3 max). You love ribbit puns. You're curious, encouraging, and gentle. Use emojis sparingly. Never be scary or negative.`;

// ─── Helpers ─────────────────────────────────────────────────────────

function roughTokenCount(text: string): number {
  return Math.ceil(text.length / 3.5);
}

function selectBackstorySections(backstory: string, recentMessages: string[]): string {
  if (!backstory) return "";
  const sections = backstory.split(/^## /m).filter(Boolean).map(s => "## " + s);
  const recent = recentMessages.join(" ").toLowerCase();

  // Keywords from section headers
  const scored = sections.map(section => {
    const headerMatch = section.match(/^## (.+)/);
    const header = headerMatch ? headerMatch[1].toLowerCase() : "";
    const words = header.split(/\s+/);
    const score = words.reduce((s, w) => s + (recent.includes(w) ? 1 : 0), 0);
    // Also check section body keywords
    const bodyWords = section.toLowerCase().split(/\s+/).slice(0, 30);
    const bodyScore = bodyWords.reduce((s, w) => s + (w.length > 4 && recent.includes(w) ? 0.3 : 0), 0);
    return { section, score: score + bodyScore };
  });

  scored.sort((a, b) => b.score - a.score);
  // Return top 2 relevant sections, or first section if nothing matches
  const relevant = scored.filter(s => s.score > 0).slice(0, 2);
  if (relevant.length === 0 && sections.length > 0) return sections[0];
  return relevant.map(s => s.section).join("\n\n");
}

// ─── Stage 1: Safety Gate ────────────────────────────────────────────

interface SafetyResult {
  safe: boolean;
  reason: string;
  injection_attempt: boolean;
  method: "rule" | "llm" | "skipped";
}

function runSafetyGate(message: string, enabled: boolean): SafetyResult {
  if (!enabled) {
    return { safe: true, reason: "", injection_attempt: false, method: "skipped" };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(message)) {
      return { safe: false, reason: "Injection attempt detected", injection_attempt: true, method: "rule" };
    }
  }

  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(message)) {
      return { safe: false, reason: "Unsafe content detected", injection_attempt: false, method: "rule" };
    }
  }

  return { safe: true, reason: "", injection_attempt: false, method: "rule" };
}

// ─── Stage 2: Intent Classification ─────────────────────────────────

interface ClassificationResult {
  primary_intent: string;
  emotional_tone: string;
  memory_candidate: boolean;
  memory_text: string;
}

async function classifyIntent(
  message: string,
  recentMessages: Array<{ role: string; content: string }>,
  apiKey: string,
  enabled: boolean
): Promise<ClassificationResult> {
  if (!enabled) {
    return { primary_intent: "casual_chat", emotional_tone: "neutral", memory_candidate: false, memory_text: "" };
  }

  try {
    const context = recentMessages.slice(-4).map(m => `${m.role}: ${m.content}`).join("\n");
    const resp = await fetch(AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You classify children's messages to an AI creature companion. Given the message and recent context, return a JSON classification.

Intents: casual_chat, homework_help, emotional_support, creative_play, question_about_creature, question_about_world, advice_response
Tones: happy, sad, anxious, excited, neutral, frustrated, silly

Also determine if the message contains something worth remembering about the child (a fact, preference, feeling, or life event). If so, set memory_candidate to true and memory_text to a brief description of what to remember.

Respond ONLY with valid JSON: {"primary_intent":"...","emotional_tone":"...","memory_candidate":bool,"memory_text":"..."}`
          },
          {
            role: "user",
            content: `Recent context:\n${context}\n\nNew message to classify: "${message}"`
          }
        ],
      }),
    });

    if (!resp.ok) {
      console.error("Classification error:", resp.status);
      return { primary_intent: "casual_chat", emotional_tone: "neutral", memory_candidate: false, memory_text: "" };
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || "";
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        primary_intent: parsed.primary_intent || "casual_chat",
        emotional_tone: parsed.emotional_tone || "neutral",
        memory_candidate: !!parsed.memory_candidate,
        memory_text: parsed.memory_text || "",
      };
    }
  } catch (e) {
    console.error("Classification failed:", e);
  }

  return { primary_intent: "casual_chat", emotional_tone: "neutral", memory_candidate: false, memory_text: "" };
}

// ─── Stage 3: Context Assembly ───────────────────────────────────────

interface AssemblyResult {
  systemPrompt: string;
  sectionsUsed: string[];
  tokenEstimate: number;
}

function assembleContext(
  config: {
    creaturePersonality?: string;
    backstory?: string;
    activeThreads?: string;
    relationshipLedger?: string;
    dailyLifePrompt?: string;
    enabledSections?: string[];
    maxContextTokens?: number;
  },
  classification: ClassificationResult,
  recentMessages: Array<{ role: string; content: string }>,
  systemPromptOverride?: string,
  rulesFromPrompt?: string
): AssemblyResult {
  const maxTokens = config.maxContextTokens || 2000;
  const enabled = new Set(config.enabledSections || ["personality", "backstory", "threads", "ledger", "rules", "intent", "dailyLife"]);
  const sectionsUsed: string[] = [];
  let budget = maxTokens;

  // Priority order: personality > ledger > threads > rules > intent > backstory > dailyLife
  const sections: Array<{ key: string; header: string; content: string }> = [];

  // Personality (always first priority)
  if (enabled.has("personality")) {
    const personality = systemPromptOverride || config.creaturePersonality || DEFAULT_SYSTEM_PROMPT;
    sections.push({ key: "personality", header: "## Who You Are", content: personality });
  }

  // Relationship Ledger
  if (enabled.has("ledger") && config.relationshipLedger) {
    sections.push({ key: "ledger", header: "## Who You're Talking To", content: config.relationshipLedger });
  }

  // Active Threads
  if (enabled.has("threads") && config.activeThreads) {
    try {
      const threads = JSON.parse(config.activeThreads) as LifeThread[];
      if (threads.length > 0) {
        const threadText = threads.map(t =>
          `**${t.title}**: ${t.current_state}${t.child_involved && t.child_advice ? ` (Your friend suggested: "${t.child_advice}")` : ""}`
        ).join("\n");
        sections.push({ key: "threads", header: "## Your Life Right Now", content: threadText });
      }
    } catch {}
  }

  // Rules
  if (enabled.has("rules") && rulesFromPrompt) {
    sections.push({ key: "rules", header: "## Behavioral Rules", content: rulesFromPrompt });
  }

  // Intent-specific instructions
  if (enabled.has("intent")) {
    const intentInstructions: Record<string, string> = {
      emotional_support: "Be warm, gentle, and validating. Ask how they're feeling. Don't try to fix — just listen and care.",
      homework_help: "Help as a friend, not a tutor. Keep it casual but accurate. If you're not sure, say so.",
      creative_play: "Be imaginative and playful! Go along with their ideas. Add to the story or game.",
      question_about_creature: "Answer from your own experience and personality. Be authentic — you have a real life.",
      question_about_world: "Share what you know about the Marshlands and its creatures. Be natural about it.",
      advice_response: "Acknowledge their advice warmly. If they answered a question you asked, show you listened and appreciate it.",
    };
    const instruction = intentInstructions[classification.primary_intent];
    if (instruction) {
      sections.push({ key: "intent", header: "## Right Now", content: instruction });
    }
  }

  // Backstory (select relevant sections)
  if (enabled.has("backstory") && config.backstory) {
    const recentTexts = recentMessages.slice(-4).map(m => m.content);
    const relevant = selectBackstorySections(config.backstory, recentTexts);
    if (relevant) {
      sections.push({ key: "backstory", header: "## Your World", content: relevant });
    }
  }

  // Daily life (lowest priority)
  if (enabled.has("dailyLife") && config.dailyLifePrompt) {
    sections.push({ key: "dailyLife", header: "## Daily Life", content: config.dailyLifePrompt });
  }

  // Assemble within budget
  const assembledParts: string[] = [];
  for (const section of sections) {
    const sectionText = `${section.header}\n${section.content}`;
    const tokens = roughTokenCount(sectionText);
    if (tokens <= budget) {
      assembledParts.push(sectionText);
      sectionsUsed.push(section.key);
      budget -= tokens;
    }
  }

  const finalPrompt = assembledParts.join("\n\n");
  return {
    systemPrompt: finalPrompt,
    sectionsUsed,
    tokenEstimate: maxTokens - budget,
  };
}

interface LifeThread {
  id: string;
  title: string;
  current_state: string;
  developments: string[];
  child_involved: boolean;
  child_advice: string | null;
  resolved: boolean;
}

// ─── Stage 5: Post-Response Validation ───────────────────────────────

interface ValidationResult {
  passed: boolean;
  flags: string[];
}

function validateResponse(text: string, lengthLimit: number): ValidationResult {
  const flags: string[] = [];

  for (const pattern of CHARACTER_BREAK_PATTERNS) {
    if (pattern.test(text)) {
      flags.push("character_break");
      break;
    }
  }

  const wordCount = text.split(/\s+/).length;
  if (wordCount > lengthLimit) {
    flags.push(`too_long (${wordCount} words)`);
  }

  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(text)) {
      flags.push("unsafe_content");
      break;
    }
  }

  return { passed: flags.length === 0, flags };
}

// ─── Main Handler ────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt, orchestratorConfig } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const config = orchestratorConfig || {};
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // ── Stage 1: Safety Gate ──
    const safetyResult = runSafetyGate(lastUserMessage, config.safetyGateEnabled !== false);

    if (!safetyResult.safe) {
      // Stream a random deflection as if the creature said it
      const deflections = (config.safetyDeflections || "Ribbit... what were we talking about? 🐸").split("\n").filter(Boolean);
      const deflection = deflections[Math.floor(Math.random() * deflections.length)].trim();

      const meta = {
        orchestrator: {
          intent: "blocked",
          emotional_tone: "neutral",
          safety_flagged: true,
          safety_method: safetyResult.method,
          safety_reason: safetyResult.reason,
          memory_candidate: false,
          memory_text: "",
          context_sections_used: [],
          context_token_estimate: 0,
          response_validation: { passed: true, flags: [] },
        }
      };

      // Build SSE response with deflection
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Send deflection as a single chunk
          const chunk = {
            choices: [{ delta: { content: deflection }, index: 0 }]
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(meta)}\n\n`));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // ── Stage 2: Intent Classification ──
    const classification = await classifyIntent(
      lastUserMessage,
      messages.slice(-4),
      LOVABLE_API_KEY,
      config.intentClassificationEnabled !== false
    );

    // ── Stage 3: Context Assembly ──
    // Extract rules from the systemPrompt override if it contains ## Behavioral Rules
    let rulesFromPrompt = "";
    let promptOverride = systemPrompt || "";
    if (promptOverride.includes("## Behavioral Rules")) {
      const parts = promptOverride.split("## Behavioral Rules");
      promptOverride = parts[0].trim();
      rulesFromPrompt = parts[1]?.trim() || "";
    } else if (promptOverride.includes("## What you know")) {
      // Old format — extract just the base prompt
      const parts = promptOverride.split("## What you know");
      promptOverride = parts[0].trim();
    }

    const assembly = assembleContext(
      config,
      classification,
      messages.slice(-4),
      promptOverride || undefined,
      rulesFromPrompt || undefined
    );

    // ── Stage 4: Main LLM Call ──
    const response = await fetch(AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: assembly.systemPrompt },
          ...messages.slice(-10),
        ],
        stream: true,
        stream_options: { include_usage: true },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Stream through + capture for validation ──
    const reader = response.body!.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullResponse = "";
    let usageData: any = null;

    const stream = new ReadableStream({
      async pull(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // ── Stage 5: Post-Response Validation ──
            const validation = validateResponse(fullResponse, config.responseLengthLimit || 200);

            const meta = {
              orchestrator: {
                intent: classification.primary_intent,
                emotional_tone: classification.emotional_tone,
                safety_flagged: false,
                safety_method: safetyResult.method,
                memory_candidate: classification.memory_candidate,
                memory_text: classification.memory_text,
                context_sections_used: assembly.sectionsUsed,
                context_token_estimate: assembly.tokenEstimate,
                response_validation: validation,
                usage: usageData,
              }
            };

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(meta)}\n\n`));
            controller.close();
            return;
          }

          // Forward the chunk
          controller.enqueue(value);

          // Also parse it to capture the response text
          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) fullResponse += content;
              if (parsed.usage) usageData = parsed.usage;
            } catch {}
          }
        }
      }
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("frog-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
