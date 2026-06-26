// ─────────────────────────────────────────────────────────────────────────────
// The agent loop.
//
// One pass of "ask the model → run the tools it wanted → ask again" until the
// model stops calling tools and just speaks. Scene tools become `actions` for
// the client; data tools run here and feed results back to the model.
//
// This loop is provider-agnostic and tool-agnostic: it never names a specific
// model or a specific tool. That's what keeps the system flexible.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  AgentRequest,
  AgentResponse,
  DataSource,
  SceneAction,
} from "./types.ts";
import type { LLMMessage, LLMProvider } from "./llm/provider.ts";
import type { ToolRegistry } from "./registry.ts";
import { buildSystemPrompt } from "./prompt.ts";

export interface AgentDeps {
  llm: LLMProvider;
  registry: ToolRegistry;
  data: DataSource;
  maxSteps?: number;
}

export async function runAgent(
  req: AgentRequest,
  deps: AgentDeps,
): Promise<AgentResponse> {
  const { llm, registry, data, maxSteps = 6 } = deps;

  const messages: LLMMessage[] = [
    { role: "system", content: buildSystemPrompt(req.context) },
    ...(req.history ?? []).map((t) => ({ role: t.role, content: t.content })),
    { role: "user", content: req.message },
  ];

  const actions: SceneAction[] = [];
  const collected: Record<string, unknown> = {};
  const toolSpecs = registry.specs();

  for (let step = 0; step < maxSteps; step++) {
    const result = await llm.chat(messages, toolSpecs);

    // No tool calls → the model is done. This text is what Atlas says.
    if (result.toolCalls.length === 0) {
      return { speech: result.text ?? "", actions, data: collected };
    }

    // Record the assistant's tool-calling turn so the model has continuity.
    messages.push({
      role: "assistant",
      content: result.text ?? "",
      toolCalls: result.toolCalls,
    });

    // Resolve each requested tool.
    for (const call of result.toolCalls) {
      const tool = registry.get(call.name);

      if (!tool) {
        messages.push(toolResult(call.id, { error: `unknown tool: ${call.name}` }));
        continue;
      }

      if (tool.kind === "scene") {
        // Queue it for the client; tell the model it's handled so it continues.
        actions.push({ tool: call.name, args: call.args });
        messages.push(toolResult(call.id, { status: "queued", tool: call.name }));
      } else {
        // Data tool: run server-side, feed the result back into the model.
        try {
          const out = await tool.execute!(call.args, { data, request: req });
          collected[call.name] = out;
          messages.push(toolResult(call.id, out));
        } catch (err) {
          messages.push(toolResult(call.id, { error: String(err) }));
        }
      }
    }
  }

  // Safety net: we hit the step cap. Force a closing line, keep queued actions.
  const closing = await llm.chat(
    [...messages, { role: "user", content: "Reply to the user now in one short sentence." }],
    [],
  );
  return { speech: closing.text ?? "Done.", actions, data: collected };
}

function toolResult(toolCallId: string, payload: unknown): LLMMessage {
  return { role: "tool", toolCallId, content: JSON.stringify(payload) };
}
