// ─────────────────────────────────────────────────────────────────────────────
// LLM provider abstraction
//
// The agent loop only ever talks to this interface, never to OpenAI/Claude/Gemini
// directly. To swap models, write one more file that implements LLMProvider and
// change one line in index.ts. Nothing else moves.
// ─────────────────────────────────────────────────────────────────────────────

/** A tool description in the neutral shape the registry produces. */
export interface LLMToolSpec {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
}

/** A tool call the model wants to make. */
export interface LLMToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

/** A message in the running conversation handed to the provider. */
export interface LLMMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  /** For role:"assistant" — tool calls the model emitted. */
  toolCalls?: LLMToolCall[];
  /** For role:"tool" — which call this result answers. */
  toolCallId?: string;
}

/** One model turn: either it spoke, called tools, or both. */
export interface LLMResult {
  text: string | null;
  toolCalls: LLMToolCall[];
}

export interface LLMProvider {
  /** Run one completion with tools available. */
  chat(messages: LLMMessage[], tools: LLMToolSpec[]): Promise<LLMResult>;
}
