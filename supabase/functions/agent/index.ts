// ─────────────────────────────────────────────────────────────────────────────
// Edge function entrypoint.
//
// Composition root: this is the only file that picks concrete implementations
// (which LLM, which data source). Everything below it is wired through interfaces.
//
// Deploy:  supabase functions deploy agent --no-verify-jwt
// Secrets: supabase secrets set OPENAI_API_KEY=sk-...
// ─────────────────────────────────────────────────────────────────────────────

import { runAgent } from "./agent.ts";
import { ToolRegistry } from "./registry.ts";
import { allTools } from "./tools/index.ts";
import { makeDataSource } from "./data/source.ts";
import { OpenAIProvider } from "./llm/openai.ts";
import type { AgentRequest } from "./types.ts";

// ── Wire concrete implementations once, reuse across requests ─────────────────
const registry = new ToolRegistry().registerAll(allTools);
const data = makeDataSource();

// Pick the provider via env. Both are OpenAI-compatible, so it's the same class
// with a different baseURL/key/model. Set LLM_PROVIDER=featherless to switch.
const llm = makeLLM();

function makeLLM(): OpenAIProvider {
  const provider = (Deno.env.get("LLM_PROVIDER") ?? "openai").toLowerCase();

  if (provider === "featherless") {
    return new OpenAIProvider({
      apiKey: Deno.env.get("FEATHERLESS_API_KEY") ?? "",
      baseURL: "https://api.featherless.ai/v1",
      // Use a tool-calling-capable model. Override with ATLAS_MODEL.
      model: Deno.env.get("ATLAS_MODEL") ?? "Qwen/Qwen2.5-72B-Instruct",
    });
  }

  // default: OpenAI
  return new OpenAIProvider({
    apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
    model: Deno.env.get("ATLAS_MODEL") ?? "gpt-4o-mini",
  });
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") {
    return json({ error: "POST only" }, 405);
  }

  let body: AgentRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }
  if (!body?.message || typeof body.message !== "string") {
    return json({ error: "`message` (string) is required" }, 400);
  }

  try {
    const response = await runAgent(body, { llm, registry, data });
    return json(response);
  } catch (err) {
    console.error("[agent] failure", err);
    return json({ error: "agent failed", detail: String(err) }, 500);
  }
});

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
