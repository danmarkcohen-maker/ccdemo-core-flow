import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, knownName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a condensed transcript from user messages only
    const userLines = messages
      .filter((m: { role: string }) => m.role === "user")
      .map((m: { content: string }) => m.content)
      .join("\n");

    if (!userLines.trim()) {
      return new Response(
        JSON.stringify({ memories: { age: null, likes: [], dislikes: [], feelings: [], topics: [] } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a memory extraction system for a children's AI companion. Extract structured facts from the child's messages. The child's name is already known as "${knownName || "unknown"}" — do NOT extract the name.

Analyze ONLY what the child explicitly stated. Do not infer or guess.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Extract facts from these messages:\n\n${userLines}` },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "store_memories",
                description: "Store extracted facts about the child from their conversation messages.",
                parameters: {
                  type: "object",
                  properties: {
                    age: {
                      type: ["number", "null"],
                      description: "The child's age if explicitly mentioned, null otherwise",
                    },
                    likes: {
                      type: "array",
                      items: { type: "string" },
                      description: "Things the child said they like, love, or enjoy",
                    },
                    dislikes: {
                      type: "array",
                      items: { type: "string" },
                      description: "Things the child said they don't like or hate",
                    },
                    feelings: {
                      type: "array",
                      items: { type: "string" },
                      description: "Current emotions or feelings the child expressed",
                    },
                    topics: {
                      type: "array",
                      items: { type: "string" },
                      description: "Main topics or subjects discussed",
                    },
                  },
                  required: ["age", "likes", "dislikes", "feelings", "topics"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "store_memories" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Extraction failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(
        JSON.stringify({ memories: { age: null, likes: [], dislikes: [], feelings: [], topics: [] } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const memories = JSON.parse(toolCall.function.arguments);
    const usage = data.usage || {};

    return new Response(
      JSON.stringify({ memories, usage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("extract-memories error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
