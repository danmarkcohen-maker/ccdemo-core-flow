import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface LifeThread {
  id: string;
  title: string;
  current_state: string;
  developments: string[];
  child_involved: boolean;
  child_advice: string | null;
  resolved: boolean;
}

function getTimeSince(isoTimestamp: string | null, currentTimestamp: string): string {
  if (!isoTimestamp) return "never";
  const last = new Date(isoTimestamp).getTime();
  const now = new Date(currentTimestamp).getTime();
  const minutes = Math.floor((now - last) / (1000 * 60));
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      creaturePersonality,
      relationshipLedger,
      childProfile,
      lastSessionSummary,
      lastSessionTimestamp,
      currentTimestamp,
      lifeThreads,
      backstoryExcerpt,
      seasonContext,
      isFirstEver,
      name,
      age,
      topics,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ── First-ever greeting: skip reflection ──
    if (isFirstEver) {
      const topicPart = topics && topics.length > 0
        ? `They just told you they're interested in: ${topics.join(", ")}.`
        : "They haven't shared any specific interests yet.";

      const systemPrompt = `You are Frog, a small AI creature companion on a child's device. Generate a single warm, playful opening message to greet this child for the FIRST TIME after they just completed onboarding. Keep it 1-2 sentences max. Use simple vocabulary appropriate for a ${age}-year-old. Include a frog emoji. Be genuinely curious about them. ${topicPart} Do NOT list their interests back at them mechanically — weave one naturally into a question or comment if topics were provided, or ask an open-ended question if not. Never be generic or robotic.`;

      const response = await fetch(AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `The child's name is ${name} and they are ${age} years old. Generate a first greeting.` },
          ],
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429 || status === 402) {
          return new Response(
            JSON.stringify({ error: status === 429 ? "Rate limit exceeded" : "Usage limit reached" }),
            { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error(`AI gateway error: ${status}`);
      }

      const data = await response.json();
      const opener = data.choices?.[0]?.message?.content || `Hey ${name}! What's on your mind? 🐸`;

      return new Response(
        JSON.stringify({ opener, reflection: null, updatedThreads: null, usage: data.usage }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Step 1: Reflection ──
    const timeSince = getTimeSince(lastSessionTimestamp, currentTimestamp);
    const threads = (lifeThreads || []) as LifeThread[];
    const threadStates = threads
      .filter(t => !t.resolved)
      .map(t => `- **${t.title}**: ${t.current_state}${t.developments.length > 0 ? ` (Next development available)` : " (No further developments queued)"}${t.child_involved && t.child_advice ? ` [Child suggested: "${t.child_advice}"]` : ""}`)
      .join("\n");

    const reflectionPrompt = `You are the internal mind of a creature companion called Frog. Your friend is about to pick up their device and talk to you. Think about what you know and what's happened.

## What you know about your friend
${relationshipLedger || "Not much yet."}
${childProfile || ""}

## Last time you talked
${lastSessionSummary || "No previous session recorded."}
That was ${timeSince} ago.

## What's going on in your life
${threadStates || "Nothing specific happening right now."}

## Your world right now
${seasonContext || ""}

Think about all of this and decide:
1. Is there anything from your friend's life you'd naturally want to ask about or reference? (A test they mentioned, something they were worried about, a hobby they were excited about.) Only if enough time has passed that it makes sense to follow up.
2. Has anything developed in your own life that you'd want to share? Look at your life threads — has enough time passed that the next thing would have happened? If a thread has a pending development and it's been a reasonable amount of time, you can decide it happened.
3. What's your general mood right now given everything that's going on?

Respond with JSON only:
{"follow_up":"string or null","thread_updates":[{"thread_id":"...","advance":true/false,"reason":"..."}],"creature_mood":"string","opener_hint":"string"}`;

    const reflectionResp = await fetch(AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: reflectionPrompt },
          { role: "user", content: "Run the reflection now." },
        ],
      }),
    });

    if (!reflectionResp.ok) {
      const status = reflectionResp.status;
      if (status === 429 || status === 402) {
        return new Response(
          JSON.stringify({ error: status === 429 ? "Rate limit exceeded" : "Usage limit reached" }),
          { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Reflection AI error: ${status}`);
    }

    const reflectionData = await reflectionResp.json();
    const reflectionText = reflectionData.choices?.[0]?.message?.content || "{}";
    let reflection = { follow_up: null, thread_updates: [], creature_mood: "cheerful", opener_hint: "Just be your friendly self" };
    try {
      const jsonMatch = reflectionText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reflection = { ...reflection, ...JSON.parse(jsonMatch[0]) };
      }
    } catch (e) {
      console.error("Failed to parse reflection:", e);
    }

    // ── Step 2: Thread advancement ──
    let updatedThreads: LifeThread[] | null = null;
    if (reflection.thread_updates && reflection.thread_updates.length > 0) {
      updatedThreads = threads.map(t => {
        const update = reflection.thread_updates.find((u: any) => u.thread_id === t.id);
        if (update?.advance && t.developments.length > 0) {
          const [next, ...rest] = t.developments;
          return { ...t, current_state: next, developments: rest };
        }
        return t;
      });
    }

    // ── Step 3: Opener generation ──
    // Extract the child's name from the ledger or profile
    const nameMatch = (relationshipLedger || childProfile || "").match(/(?:Name|name):\s*(\w+)/);
    const childName = nameMatch ? nameMatch[1] : "friend";
    const childAge = (childProfile || relationshipLedger || "").match(/(?:Age|age):\s*(\d+)/)?.[1] || "10";

    const openerPrompt = `You are Frog. Your friend ${childName} just picked up their device to talk to you.

${creaturePersonality || "You are Frog, a playful creature companion."}

${reflection.opener_hint}
Your mood: ${reflection.creature_mood}

It's been ${timeSince} since you last talked.

Generate a warm, natural opening message. 1-3 sentences max. If the reflection suggested following up on something, weave it in naturally — don't make it feel like a checklist. If nothing specific came up, just be your normal friendly self. End with a question if it feels natural.

The child is ${childAge} years old — match vocabulary accordingly.`;

    const openerResp = await fetch(AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: openerPrompt },
          { role: "user", content: `Generate the opening message for ${childName}.` },
        ],
      }),
    });

    if (!openerResp.ok) {
      const status = openerResp.status;
      if (status === 429 || status === 402) {
        return new Response(
          JSON.stringify({ error: status === 429 ? "Rate limit exceeded" : "Usage limit reached" }),
          { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Opener AI error: ${status}`);
    }

    const openerData = await openerResp.json();
    const opener = openerData.choices?.[0]?.message?.content || `Hey! I was just thinking about you 🐸`;

    const totalUsage = {
      prompt_tokens: (reflectionData.usage?.prompt_tokens || 0) + (openerData.usage?.prompt_tokens || 0),
      completion_tokens: (reflectionData.usage?.completion_tokens || 0) + (openerData.usage?.completion_tokens || 0),
      total_tokens: (reflectionData.usage?.total_tokens || 0) + (openerData.usage?.total_tokens || 0),
    };

    return new Response(
      JSON.stringify({
        opener,
        reflection,
        updatedThreads,
        usage: totalUsage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("reflect-and-open error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
