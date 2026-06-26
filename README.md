# Atlas AI — the agent layer

The "Jarvis for your car" brain. The AI doesn't sit in a chat box — it **drives the 3D scene**. Every reply comes back as:

```json
{
  "speech": "The rear wing deploys at speed to add downforce.",
  "actions": [
    { "tool": "focus_camera", "args": { "target": "rear" } },
    { "tool": "highlight",    "args": { "target": "rear_wing" } },
    { "tool": "show_specs",   "args": { "part": "rear_wing" } }
  ],
  "data": { "get_part_info": { "name": "rear_wing", "specs": { "type": "Active" } } }
}
```

Flutter speaks the `speech`, runs the `actions` on your Three.js model, and renders `data` in spec cards. That's the whole contract.

## Why it's built to grow

Everything crosses through interfaces, so adding features never means rewiring:

| You want to… | You touch… | Everything else |
|---|---|---|
| Add a part/action (engine, paint shop) | one file in `tools/` | unchanged |
| Swap GPT → Claude/Gemini | one line in `index.ts` | unchanged |
| Move from seed data → Supabase | fill the tables | unchanged |
| Add a client visual effect | `executor.register(...)` in Flutter | unchanged |

## Layout

```
supabase/functions/agent/
  index.ts          # composition root — picks the LLM + data source, serves HTTP
  agent.ts          # the loop: ask model → run tools → repeat → {speech, actions}
  types.ts          # the shared contract (read this first)
  registry.ts       # holds tools, converts them to LLM specs
  prompt.ts         # Atlas's personality (no facts here)
  llm/
    provider.ts     # LLMProvider interface
    openai.ts       # the only file that knows about OpenAI
  tools/
    index.ts        # ← the one place you add features
    scene.ts        # client-executed visual tools (camera, highlight, explode…)
    knowledge.ts    # server-executed data tools (Blueprint verified facts)
  data/
    source.ts       # Supabase (Blueprint schema) OR seed fallback (auto-detected)
    seed.ts         # offline GT3 RS + Turbo S slice
flutter/atlas_agent.dart   # client + extensible ActionExecutor
```

## Data: the Blueprint verified-knowledge schema

Facts come from the Blueprint Supabase schema (github.com/ShadowEsu/Blueprint):
`cars → car_variants → car_specs / performance_tests / pricing_market /
track_records / ownership_safety / research_chunks`. The agent never states a
number the database didn't return — it says "not confirmed in the data" instead.

To go live: open your Supabase **SQL Editor** and run Blueprint's
`supabase_schema.sql`. It creates every table, enables **RLS public-read
policies** (so your `sb_publishable_` key can read), and seeds sample cars
including the 911 GT3 RS that's in the viewer. Then restart `deno task serve` —
`source.ts` auto-detects the live DB and supersedes the seed.

## Two kinds of tools

- **`kind: "scene"`** — the agent's *hands*. Emitted as `actions` for the client to execute (`focus_camera`, `highlight`, `explode`, `isolate`, `set_paint`, `reset_view`).
- **`kind: "data"`** — the agent's *verified memory*. Run on the server against the Blueprint schema: `get_part_facts`, `get_overview`, `get_performance`, `get_pricing`, `get_ownership`, `compare_cars`, `search_knowledge`, `find_car`.

## Try it on screen (no Flutter needed)

Two test pages in `web-test/`:

- **`atlas-viewer.html`** — the real product test. Loads your actual **Porsche 992
  GT3 RS** model (`models/gt3rs.glb`, extracted from your Car Anatomy Explorer) and
  wires Atlas's actions to the real part nodes — engine, coilovers, swaybars, brake
  discs, carbon wing, `carPaint` material, etc. Focus, highlight, explode, isolate,
  repaint all operate on the genuine mesh hierarchy.
- **`atlas-tester.html`** — a primitive box-car fallback (no model download, instant
  load) for quickly sanity-checking the agent.

The GT3 RS viewer must be **served over http** (browsers block a `file://` page from
loading a local `.glb` and ES-module CDNs):

```bash
deno task serve                          # terminal 1: the agent
cd web-test && python3 -m http.server 5500   # terminal 2: static server
# open http://localhost:5500/atlas-viewer.html
```

Click the orb, try "show me the engine", "explain the suspension", "isolate the
brakes", "explode the whole car", or "paint it Nardo Grey". The endpoint box
(top-right) defaults to `http://localhost:8000`.

The `AtlasScene` object + `executor` in that file are the reference implementation
of the Three.js bridge — your real Flutter viewer exposes the same method names,
and `PART_MAP` is the lookup from logical target → real GLB node names. To support
a new part on screen, add a `PART_MAP` row (client) and a target to `scene.ts` enum
(server). Mirror of the same extensibility on both sides.

## Switching LLM provider (OpenAI ⇄ Featherless)

Both are OpenAI-compatible, so it's one env flip — no code change:

```bash
# .env
LLM_PROVIDER=featherless
ATLAS_MODEL=Qwen/Qwen2.5-72B-Instruct   # pick a tool-calling-capable model
FEATHERLESS_API_KEY=rc_...
```

Set `LLM_PROVIDER=openai` (default) to go back. Note: this agent depends on
function/tool calling, so on Featherless choose a tool-trained model (Qwen2.5,
Llama 3.3 Instruct, Hermes). Base models without tool support won't drive the scene.

## Run / deploy

```bash
# type-check
deno task check

# deploy
supabase functions deploy agent --no-verify-jwt
supabase secrets set OPENAI_API_KEY=sk-...
# optional: ATLAS_MODEL=gpt-4o   |   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for live data
```

Call it:

```bash
curl -X POST https://YOURPROJECT.supabase.co/functions/v1/agent \
  -H "Authorization: Bearer YOUR_ANON_KEY" -H "Content-Type: application/json" \
  -d '{"message":"show me the suspension","context":{"carId":"demo-gt"}}'
```

---

## Worked example: adding "engines" end to end

This is the exact flow for the features you said you'll add next.

**1. Add data (now, or later in Supabase).** In `data/seed.ts`, the `engine` part already exists. To add engine *variants* or deeper specs, add rows / fields — no code.

**2. Add an engine tool.** Create `tools/engine.ts`:

```ts
import type { ToolDefinition } from "../types.ts";

export const engineTools: ToolDefinition[] = [
  {
    name: "swap_engine",
    kind: "scene",                    // visual → Flutter animates the swap
    description: "Swap in a different engine and animate the change.",
    parameters: {
      variant: {
        type: "string",
        description: "Engine to fit.",
        enum: ["flat6", "v8_twin_turbo", "electric"],
        required: true,
      },
    },
  },
  {
    name: "compare_engines",
    kind: "data",                     // factual → runs on server
    description: "Compare power, weight and 0-100 for two engines.",
    parameters: {
      a: { type: "string", description: "First engine.", required: true },
      b: { type: "string", description: "Second engine.", required: true },
    },
    execute: async (args, ctx) => {
      // ctx.data is your DataSource — query Supabase or seed here.
      return { a: args.a, b: args.b, /* ...numbers... */ };
    },
  },
];
```

**3. Register it.** In `tools/index.ts`, add two lines:

```ts
import { engineTools } from "./engine.ts";
export const allTools = [...sceneTools, ...partTools, ...engineTools];
```

**4. (Scene tools only) wire the client handler.** In Flutter:

```dart
executor.register('swap_engine', (a) => sceneBridge.call('swapEngine', a));
```

Done. The model can now reason about engines, narrate them, and animate swaps. `agent.ts`, `registry.ts`, `index.ts`, and the LLM layer were never touched — that's the flexibility you asked for.

## The Three.js bridge (the only glue you still write)

Flutter ↔ your existing HTML/Three.js viewer. Wrap the viewer in a WebView and pass actions across:

- **Flutter → scene:** `webViewController.runJavaScript('window.AtlasScene.focusCamera(${jsonArgs})')`
- **scene → Flutter:** a JS channel that calls back when a part is tapped, so you can `atlas.send('what is this?', context: {selectedPart: 'engine'})`.

Inside the viewer expose one object:

```js
window.AtlasScene = {
  focusCamera: ({target}) => { /* tween camera */ },
  highlight:   ({target}) => { /* emissive glow */ },
  explode:     ({target}) => { /* offset meshes */ },
  setPaint:    ({color})  => { /* swap body material */ },
  resetView:   () => { /* back to default */ },
};
```

Your `ActionExecutor` handlers just forward each action to the matching `AtlasScene` method by name — so the bridge, too, grows by one line per new action.
