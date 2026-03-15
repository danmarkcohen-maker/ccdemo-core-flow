import type { OrchestratorMeta } from "@/hooks/useCreatureConfig";

type Msg = { role: "user" | "assistant"; content: string };

export interface UsageData {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/frog-chat`;

export async function streamFrogChat({
  messages,
  systemPrompt,
  orchestratorConfig,
  onDelta,
  onDone,
  onError,
  onUsage,
  onOrchestratorMeta,
}: {
  messages: Msg[];
  systemPrompt?: string;
  orchestratorConfig?: Record<string, unknown>;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (error: string) => void;
  onUsage?: (usage: UsageData) => void;
  onOrchestratorMeta?: (meta: OrchestratorMeta) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      messages: messages.slice(-10),
      ...(systemPrompt ? { systemPrompt } : {}),
      ...(orchestratorConfig ? { orchestratorConfig } : {}),
    }),
  });

  if (!resp.ok) {
    let errorMsg = "Something went wrong";
    try {
      const err = await resp.json();
      errorMsg = err.error || errorMsg;
    } catch {}
    onError?.(errorMsg);
    onDone();
    return;
  }

  if (!resp.body) {
    onError?.("No response body");
    onDone();
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let streamDone = false;

  const processLine = (line: string) => {
    if (line.endsWith("\r")) line = line.slice(0, -1);
    if (line.startsWith(":") || line.trim() === "") return false;
    if (!line.startsWith("data: ")) return false;

    const jsonStr = line.slice(6).trim();
    if (jsonStr === "[DONE]") return true;

    try {
      const parsed = JSON.parse(jsonStr);

      // Check for orchestrator metadata (sent after [DONE])
      if (parsed.orchestrator && onOrchestratorMeta) {
        onOrchestratorMeta(parsed.orchestrator);
        return false;
      }

      // Check for usage in final chunk
      if (parsed.usage && onUsage) {
        onUsage({
          prompt_tokens: parsed.usage.prompt_tokens || 0,
          completion_tokens: parsed.usage.completion_tokens || 0,
          total_tokens: parsed.usage.total_tokens || 0,
        });
      }
      const content = parsed.choices?.[0]?.delta?.content as string | undefined;
      if (content) onDelta(content);
    } catch {
      return "retry" as const;
    }
    return false;
  };

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      const result = processLine(line);
      if (result === true) {
        streamDone = true;
        break;
      }
      if (result === "retry") {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }

  // Flush remaining — important for orchestrator metadata which arrives after [DONE]
  if (buffer.trim()) {
    for (const raw of buffer.split("\n")) {
      if (!raw) continue;
      processLine(raw);
    }
  }

  onDone();
}
