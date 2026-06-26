# BluePrint AI

Competition build: landing page, 3D vehicle lab, Supabase data, Featherless AI agent, Flutter reference client.

## Run locally

**Terminal 1 — site**
```bash
npm run dev
# → http://localhost:4173
```

**Terminal 2 — AI agent**
```bash
npm run dev:agent
# → http://localhost:8000
```

Copy `.env.example` to `.env` and add your Featherless + Supabase keys.

Open `index.html` → **Launch App** → pick a car → ask Blueprint in the assistant panel.

The app falls back to **local scene knowledge** if the agent is offline. When the agent is up, status shows **Supabase agent connected**.

## Deploy to Vercel (fast)

1. Push this repo to GitHub.
2. Import in [Vercel](https://vercel.com/new).
3. Add environment variables (Production + Preview):
   - `FEATHERLESS_API_KEY`
   - `LLM_PROVIDER` = `featherless`
   - `ATLAS_MODEL` = `Qwen/Qwen2.5-7B-Instruct`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only, never in browser)
4. Deploy. The static app is at `/`, the agent is at `/api/agent` (no second server needed).

## Supabase

Schema: `supabase/migrations/20260626000000_blueprint_schema.sql`

Run in Supabase SQL Editor or:
```bash
supabase db push
```

Flutter reference app: `integrations/blueprint-flutter/`

## Deno agent (optional)

```bash
cd agent && cp .env.example .env && deno task serve
```

Same port 8000. Use for Supabase Edge Function development under `agent/supabase/functions/agent/`.
