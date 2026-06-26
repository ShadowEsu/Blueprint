// ─────────────────────────────────────────────────────────────────────────────
// Tool barrel — the ONE place you touch to add a feature.
//
//   scene tools     → the agent's hands (camera, highlight, explode, paint…)
//   knowledge tools → the agent's verified memory (Blueprint car data)
//
// To add a feature: create a tools/<name>.ts exporting ToolDefinition[], import
// it here, add it to the array. Registry / agent loop / LLM layer don't change.
// ─────────────────────────────────────────────────────────────────────────────

import type { ToolDefinition } from "../types.ts";
import { sceneTools } from "./scene.ts";
import { knowledgeTools } from "./knowledge.ts";

export const allTools: ToolDefinition[] = [
  ...sceneTools,
  ...knowledgeTools,
];
