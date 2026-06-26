# BluePrint AI

Launch site at `/` → **Launch App** opens the Interactive Car Assembly Explorer at `/explorer/`.

## Local

```bash
npm run dev          # http://localhost:4173
npm run dev:agent    # http://localhost:8000 (AI)
```

## Vercel

- Site: `/` (landing) + `/explorer/` (garage, 3D cars, wind tunnel)
- AI: `/api/agent` (Featherless + Supabase env vars)
- Large GLBs load from jsDelivr on `*.vercel.app` (keeps deploy under 100MB)

## Kept

- `index.html` — Featherless/Supabase launch page
- `explorer/` — Interactive Car Assembly Explorer 2 (your main app)
- `api/agent.js` — serverless AI
- `supabase/` — schema + migrations
- `integrations/blueprint-flutter/` — Flutter reference client
