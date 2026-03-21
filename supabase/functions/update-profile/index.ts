import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentProfile, currentLedger, conversation, knownName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build conversation transcript
    const transcript = (conversation || [])
      .map((m: { role: string; content: string }) => `${m.role === "user" ? knownName || "Child" : "Frog"}: ${m.content}`)
      .join("\n");

    if (!transcript.trim()) {
      return new Response(
        JSON.stringify({
          updatedProfile: currentProfile || "",
          updatedLedger: currentLedger || "",
          sessionSummary: "",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You maintain a profile of a child who talks to an AI creature companion. Given the current profile and the new conversation, produce an UPDATED profile.

## Current Profile
${currentProfile || "No profile yet."}

## Current Relationship Notes
${currentLedger || "No relationship notes yet."}

## New Conversation
${transcript}

Update the profile incorporating anything new from this conversation. Follow these rules:
- REPLACE the profile, don't append to it. Keep it concise.
- Track: basic facts (name, age, school year, family, pets), current interests (what they're into RIGHT NOW, not historical), life context (upcoming events, recent events, ongoing situations, worries, excitements), friends and people they mention, and how they seem to be feeling lately.
- Life context is the most important section. If the child mentions a test, a trip, a birthday, a problem with a friend — capture it with enough detail that the creature could follow up naturally later.
- Interests should reflect recency. If the child used to talk about dinosaurs but now talks about space, space should be more prominent.
- If something from the old profile wasn't mentioned and isn't a permanent fact, it can fade or be summarised more briefly.
- Keep the whole profile under 300 words.

Also update the relationship notes:
- How does the child relate to the creature? (trusting, playful, testing boundaries, opens up about feelings, keeps things light)
- Any significant emotional moments from this conversation?
- Did the child give the creature any advice or help?

Keep relationship notes under 100 words.

Respond with JSON only:
{"updatedProfile":"string","updatedLedger":"string","sessionSummary":"string — 1-2 sentence summary of this conversation"}`;

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
          { role: "user", content: "Process the conversation and return the updated profile." },
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
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(
        JSON.stringify({ error: "Profile update failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    let result = {
      updatedProfile: currentProfile || "",
      updatedLedger: currentLedger || "",
      sessionSummary: "",
    };

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const stringify = (v: unknown): string =>
          typeof v === "string" ? v : typeof v === "object" && v !== null ? JSON.stringify(v, null, 2) : String(v ?? "");
        result = {
          updatedProfile: stringify(parsed.updatedProfile) || result.updatedProfile,
          updatedLedger: stringify(parsed.updatedLedger) || result.updatedLedger,
          sessionSummary: stringify(parsed.sessionSummary) || "",
        };
      }
    } catch (e) {
      console.error("Failed to parse profile update:", e);
    }

    return new Response(
      JSON.stringify({ ...result, usage: data.usage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("update-profile error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
