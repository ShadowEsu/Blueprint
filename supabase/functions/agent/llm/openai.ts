// ─────────────────────────────────────────────────────────────────────────────
// OpenAI-compatible implementation of LLMProvider.
//
// Works for ANY OpenAI-compatible endpoint — OpenAI itself, Featherless,
// Together, Groq, a local server — just by setting `baseURL`. Featherless and
// friends speak the same function-calling protocol, so no second class needed.
//
// Want a non-compatible provider (e.g. Anthropic's native API)? Copy this file,
// implement the same `chat()`, swap it in index.ts.
// ─────────────────────────────────────────────────────────────────────────────

import OpenAI from "npm:openai@4";
import type {
  LLMMessage,
  LLMProvider,
  LLMResult,
  LLMToolSpec,
} from "./provider.ts";

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  /** Override for OpenAI-compatible providers, e.g. https://api.featherless.ai/v1 */
  baseURL?: string;
}

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;
  private temperature: number;

  constructor(cfg: OpenAIConfig) {
    this.client = new OpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL });
    this.model = cfg.model ?? "gpt-4o-mini";
    this.temperature = cfg.temperature ?? 0.4;
  }

  async chat(messages: LLMMessage[], tools: LLMToolSpec[]): Promise<LLMResult> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: this.temperature,
      messages: messages.map(toOpenAIMessage),
      tools: tools.length
        ? tools.map((t) => ({
          type: "function" as const,
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          },
        }))
        : undefined,
    });

    const choice = completion.choices[0]?.message;
    const toolCalls = (choice?.tool_calls ?? []).map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      args: safeParse(tc.function.arguments),
    }));

    return { text: choice?.content ?? null, toolCalls };
  }
}

function toOpenAIMessage(m: LLMMessage) {
  switch (m.role) {
    case "assistant":
      return {
        role: "assistant" as const,
        content: m.content || null,
        tool_calls: m.toolCalls?.length
          ? m.toolCalls.map((tc) => ({
            id: tc.id,
            type: "function" as const,
            function: { name: tc.name, arguments: JSON.stringify(tc.args) },
          }))
          : undefined,
      };
    case "tool":
      return {
        role: "tool" as const,
        content: m.content,
        tool_call_id: m.toolCallId!,
      };
    default:
      return { role: m.role, content: m.content };
  }
}

function safeParse(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}
