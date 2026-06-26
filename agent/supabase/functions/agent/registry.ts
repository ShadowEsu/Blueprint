// ─────────────────────────────────────────────────────────────────────────────
// Tool registry
//
// Holds every tool the agent can use and converts them into the provider-neutral
// spec the LLM layer understands. Adding a tool = register() it once.
// ─────────────────────────────────────────────────────────────────────────────

import type { ToolDefinition } from "./types.ts";
import type { LLMToolSpec } from "./llm/provider.ts";

export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  register(tool: ToolDefinition): this {
    if (this.tools.has(tool.name)) {
      console.warn(`[registry] overwriting tool "${tool.name}"`);
    }
    this.tools.set(tool.name, tool);
    return this;
  }

  registerAll(tools: ToolDefinition[]): this {
    for (const t of tools) this.register(t);
    return this;
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  all(): ToolDefinition[] {
    return [...this.tools.values()];
  }

  /** Provider-neutral specs handed to the LLM on every call. */
  specs(): LLMToolSpec[] {
    return this.all().map(toLLMSpec);
  }
}

function toLLMSpec(tool: ToolDefinition): LLMToolSpec {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const [key, p] of Object.entries(tool.parameters)) {
    const schema: Record<string, unknown> = {
      type: p.type,
      description: p.description,
    };
    if (p.enum) schema.enum = p.enum;
    if (p.items) schema.items = p.items;
    properties[key] = schema;
    if (p.required) required.push(key);
  }

  return {
    name: tool.name,
    description: tool.description,
    parameters: { type: "object", properties, required },
  };
}
