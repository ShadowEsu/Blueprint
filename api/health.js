/** GET /api/health — service + Supabase connectivity check for Vercel. */
import { createClient } from "@supabase/supabase-js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function makeDb() {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

  const db = makeDb();
  let supabaseOk = false;
  let carCount = 0;

  if (db) {
    try {
      const { count, error } = await db
        .from("cars")
        .select("*", { count: "exact", head: true });
      supabaseOk = !error;
      carCount = count ?? 0;
    } catch {
      supabaseOk = false;
    }
  }

  return res.status(200).json({
    ok: true,
    service: "blueprint",
    agent: "/api/agent",
    app: "/app.html",
    providers: {
      featherless: Boolean(process.env.FEATHERLESS_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
    },
    supabase: {
      configured: Boolean(db),
      connected: supabaseOk,
      cars: carCount,
    },
    model: process.env.ATLAS_MODEL || null,
  });
}
