/**
 * Vercel serverless Blueprint agent — Featherless + Supabase.
 * Mirrors supabase/functions/agent/ for production hosting on Vercel.
 */
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SCENE_TARGETS = [
  "engine", "exhaust", "suspension", "transmission", "brakes", "wheels",
  "rear_wing", "cooling", "fuel", "body", "doors", "interior",
  "front", "rear", "left", "right", "top", "whole_car",
];

const TOOLS = [
  { type: "function", function: { name: "focus_camera", description: "Move camera to frame a part.", parameters: { type: "object", properties: { target: { type: "string", enum: SCENE_TARGETS } }, required: ["target"] } } },
  { type: "function", function: { name: "highlight", description: "Glow a part.", parameters: { type: "object", properties: { target: { type: "string", enum: SCENE_TARGETS } }, required: ["target"] } } },
  { type: "function", function: { name: "explode", description: "Exploded view of a part.", parameters: { type: "object", properties: { target: { type: "string", enum: SCENE_TARGETS } }, required: ["target"] } } },
  { type: "function", function: { name: "isolate", description: "Hide everything except target part.", parameters: { type: "object", properties: { target: { type: "string", enum: SCENE_TARGETS } }, required: ["target"] } } },
  { type: "function", function: { name: "reset_view", description: "Reset camera and parts.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "set_paint", description: "Change body paint color.", parameters: { type: "object", properties: { color: { type: "string" } }, required: ["color"] } } },
  { type: "function", function: { name: "airflow", description: "Toggle illustrative airflow streamlines on the vehicle.", parameters: { type: "object", properties: { active: { type: "boolean" } } } } },
  { type: "function", function: { name: "show_labels", description: "Show part labels.", parameters: { type: "object", properties: { target: { type: "string", enum: SCENE_TARGETS } } } } },
  { type: "function", function: { name: "show_specs", description: "Open spec card for a part.", parameters: { type: "object", properties: { part: { type: "string" } }, required: ["part"] } } },
  { type: "function", function: { name: "get_part_facts", description: "Verified specs for a car part.", parameters: { type: "object", properties: { part: { type: "string" }, car: { type: "string" } }, required: ["part"] } } },
  { type: "function", function: { name: "get_overview", description: "Car identity and summary.", parameters: { type: "object", properties: { car: { type: "string" } } } } },
  { type: "function", function: { name: "get_performance", description: "Performance test data.", parameters: { type: "object", properties: { car: { type: "string" } } } } },
  { type: "function", function: { name: "get_pricing", description: "Pricing and market data.", parameters: { type: "object", properties: { car: { type: "string" } } } } },
  { type: "function", function: { name: "search_knowledge", description: "Search research chunks.", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } },
  { type: "function", function: { name: "find_car", description: "Find a car by name.", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } },
];

const SCENE = new Set(["focus_camera", "highlight", "explode", "isolate", "reset_view", "set_paint", "show_labels", "show_specs", "airflow"]);

const SEED = {
  cars: [
    { id: "car_gt3rs", make: "Porsche", model: "911 GT3 RS", generation: "992.1", model_year: 2024, current_status: "Discontinued",
      summary: "Track-focused NA 911 with 4.0L flat-6, 518 hp.", caveats: "GT3 RS discontinued 2024. No 2025/2026 model." },
    { id: "car_tourbillon", make: "Bugatti", model: "Tourbillon", generation: "Chiron successor", model_year: 2026, current_status: "In Development",
      summary: "8.3L quad-turbo W16 hybrid hypercar, ~1,775 hp combined.", caveats: "Pre-production specs; final figures may change." },
    { id: "car_laferrari", make: "Ferrari", model: "LaFerrari", generation: "F150", model_year: 2015, current_status: "Discontinued",
      summary: "6.3L V12 HY-KERS hybrid hypercar, 949 hp combined. Ferrari F1-derived chassis.", caveats: "499 coupes + 210 Aperta built 2013–2016. No longer in production." },
    { id: "car_turbos", make: "Porsche", model: "911 Turbo S", generation: "992.1", model_year: 2026, current_status: "In Production",
      summary: "Twin-turbo flat-6, 650 hp, AWD.", caveats: "2026 details may vary." },
    { id: "car_svj", make: "Lamborghini", model: "Aventador SVJ", generation: "LB834", model_year: 2019, current_status: "Discontinued",
      summary: "Naturally aspirated 6.5L V12 with ALA 2.0 active aero, 759 hp.", caveats: "Limited production flagship." },
    { id: "car_chiron", make: "Bugatti", model: "Chiron", generation: "Chiron", model_year: 2020, current_status: "Discontinued",
      summary: "8.0L quad-turbo W16 hypercar, 1,479 hp.", caveats: "Profilée and other variants vary by trim." },
  ],
  variants: [
    { id: "var_gt3rs", car_id: "car_gt3rs", variant_name: "GT3 RS", drivetrain: "RWD", transmission: "7-Speed PDK", is_primary_variant: true },
    { id: "var_tourbillon", car_id: "car_tourbillon", variant_name: "Tourbillon", drivetrain: "AWD", transmission: "8-Speed dual-clutch", is_primary_variant: true },
    { id: "var_laferrari", car_id: "car_laferrari", variant_name: "LaFerrari Coupe", drivetrain: "RWD", transmission: "7-Speed DCT", is_primary_variant: true },
    { id: "var_turbos", car_id: "car_turbos", variant_name: "Turbo S Coupe", drivetrain: "AWD", transmission: "8-Speed PDK", is_primary_variant: true },
    { id: "var_svj", car_id: "car_svj", variant_name: "SVJ", drivetrain: "AWD", transmission: "7-Speed ISR", is_primary_variant: true },
    { id: "var_chiron", car_id: "car_chiron", variant_name: "Profilée", drivetrain: "AWD", transmission: "7-Speed DCT", is_primary_variant: true },
  ],
  specs: [
    { variant_id: "var_gt3rs", engine: "4.0L Naturally Aspirated Flat-6", displacement_liters: 4.0, aspiration: "Naturally Aspirated",
      horsepower_hp: 518, torque_lb_ft: 343, weight_kg: 1440, brake_front: "410mm Ceramic Composite", brake_rear: "390mm Ceramic Composite",
      suspension: "PASM Sport with adaptive dampers", tire_front: "275/35ZR20", tire_rear: "335/30ZR21" },
    { variant_id: "var_tourbillon", engine: "8.3L Quad-Turbo W16 + 3 electric motors", displacement_liters: 8.3, aspiration: "Quad-Turbo + Hybrid",
      horsepower_hp: 1775, torque_lb_ft: null, weight_kg: null },
    { variant_id: "var_laferrari", engine: "6.3L V12 + HY-KERS electric motor", displacement_liters: 6.3, aspiration: "Naturally Aspirated + Hybrid",
      horsepower_hp: 949, torque_lb_ft: 664, weight_kg: 1255, tire_front: "265/30 ZR19", tire_rear: "345/30 ZR20" },
    { variant_id: "var_turbos", engine: "3.7L Twin-Turbo Flat-6", displacement_liters: 3.7, horsepower_hp: 650, torque_lb_ft: 590, weight_kg: 1572 },
    { variant_id: "var_svj", engine: "6.5L Naturally Aspirated V12", displacement_liters: 6.5, horsepower_hp: 759, torque_lb_ft: 531, weight_kg: 1575 },
    { variant_id: "var_chiron", engine: "8.0L Quad-Turbo W16", displacement_liters: 8.0, horsepower_hp: 1479, weight_kg: 1995 },
  ],
  perf: [
    { variant_id: "var_gt3rs", test_type: "Acceleration Test", source_type: "official", zero_to_60_mph_sec: 3.0, top_speed_mph: 184, notes: "Weissach 0.2s faster." },
    { variant_id: "var_gt3rs", test_type: "Nürburgring Lap", source_type: "third_party", notes: "6:43.300 Nordschleife with Weissach package." },
  ],
  pricing: [
    { variant_id: "var_gt3rs", price_type: "launch_msrp", amount: 223800, currency: "USD", context: "Base MSRP USA" },
  ],
  chunks: [
    { chunk_title: "GT3 RS Discontinuation", chunk_text: "992.1 GT3 RS discontinued 2024. ~3,000 units. No 2025/2026 model." },
    { chunk_title: "GT3 RS Aero", chunk_text: "Swan-neck DRS rear wing and active aero — highest downforce of any road-legal 911." },
    { chunk_title: "Tourbillon W16", chunk_text: "Bugatti Tourbillon uses a new 8.3L naturally aspirated W16 with four turbos and three electric motors for ~1,775 hp. Replaces the Chiron as Bugatti's flagship." },
    { chunk_title: "Tourbillon Hybrid", chunk_text: "Three electric motors assist the W16 — one integrated in the transaxle, two driving the front axle for torque vectoring and instant response." },
    { chunk_title: "LaFerrari HY-KERS", chunk_text: "LaFerrari combines a 6.3L V12 (789 hp) with an electric motor (120 hp) and KERS-derived gearbox assist (40 hp) for 949 hp total. 0–100 km/h under 3 seconds, top speed 350 km/h." },
    { chunk_title: "LaFerrari Aero", chunk_text: "Active aerodynamics with front and rear diffusers, plus a rear spoiler that adjusts for drag reduction or maximum downforce. Cd approximately 0.33." },
  ],
};

function systemPrompt(car = "Porsche 911 GT3 RS") {
  return `You are Blueprint, the AI co-pilot inside a 3D vehicle lab. The user is viewing: ${car}.
Drive the 3D scene with tools: focus_camera, highlight, explode, isolate, reset_view, set_paint, show_specs, show_labels.
Use set_paint whenever the user asks to change color, paint, or wrap the car. Color can be a name (red, Nardo Grey, Guards Red) or hex.
Use data tools (get_part_facts, get_overview, get_performance, get_pricing, search_knowledge, find_car) for verified facts only.
Never invent specs. Keep spoken replies to 1–2 sentences. Always emit scene actions when the user wants a visual change.`;
}

function makeLLM() {
  const key = process.env.FEATHERLESS_API_KEY || process.env.OPENAI_API_KEY;
  const useFeatherless = process.env.LLM_PROVIDER === "featherless" || Boolean(process.env.FEATHERLESS_API_KEY);
  return new OpenAI({
    apiKey: key,
    baseURL: useFeatherless ? "https://api.featherless.ai/v1" : undefined,
  });
}

function makeDb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_PUBLISHABLE_KEY
    || process.env.SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

async function resolveCar(db, query) {
  const q = String(query || "911 GT3 RS").toLowerCase();
  if (db) {
    const modelQ = q.replace(/911\s*/i, "").trim();
    let { data } = await db.from("cars").select("*").ilike("model", `%${modelQ}%`).limit(1);
    if (!data?.length) {
      const alt = await db.from("cars").select("*").ilike("make", `%${query}%`).limit(1);
      data = alt.data;
    }
    if (data?.[0]) return data[0];
  }
  return SEED.cars.find((c) =>
    `${c.make} ${c.model}`.toLowerCase().includes(q) || c.model.toLowerCase().includes(q.replace("911 ", ""))
  ) ?? null;
}

async function getVariant(db, carId) {
  if (db) {
    const { data } = await db.from("car_variants").select("*").eq("car_id", carId).order("is_primary_variant", { ascending: false }).limit(1);
    if (data?.[0]) return data[0];
  }
  return SEED.variants.find((v) => v.car_id === carId) ?? null;
}

async function getSpecs(db, variantId) {
  if (db) {
    const { data } = await db.from("car_specs").select("*").eq("variant_id", variantId).limit(1);
    if (data?.[0]) return data[0];
  }
  return SEED.specs.find((s) => s.variant_id === variantId) ?? null;
}

function partFacts(part, specs, variant) {
  const f = {};
  const s = specs || {};
  const put = (k, v) => { if (v != null && v !== "") f[k] = v; };
  switch (part) {
    case "engine":
      put("engine", s.engine); put("displacement", s.displacement_liters && `${s.displacement_liters} L`);
      put("horsepower", s.horsepower_hp && `${s.horsepower_hp} hp`); put("torque", s.torque_lb_ft && `${s.torque_lb_ft} lb-ft`);
      break;
    case "brakes": put("front", s.brake_front); put("rear", s.brake_rear); break;
    case "suspension": put("suspension", s.suspension); break;
    case "wheels": put("tireFront", s.tire_front); put("tireRear", s.tire_rear); break;
    case "transmission": put("transmission", variant?.transmission); put("drivetrain", variant?.drivetrain); break;
    case "body":
      put("weight", s.weight_kg && `${s.weight_kg} kg`); put("length", s.length_in && `${s.length_in} in`);
      break;
    default: put("engine", s.engine);
  }
  return f;
}

async function runDataTool(db, name, args, defaultCar) {
  const carQuery = args.car || defaultCar;

  if (name === "find_car") {
    const car = await resolveCar(db, args.query);
    return car ? { found: true, name: `${car.make} ${car.model}`, summary: car.summary, status: car.current_status } : { found: false };
  }

  if (name === "search_knowledge") {
    if (db) {
      const { data } = await db.from("research_chunks").select("chunk_title, chunk_text, chunk_type")
        .or(`chunk_text.ilike.%${args.query}%,chunk_title.ilike.%${args.query}%`).limit(6);
      if (data?.length) return { chunks: data };
    }
    const q = String(args.query).toLowerCase();
    const hits = SEED.chunks.filter((c) => c.chunk_text.toLowerCase().includes(q) || c.chunk_title.toLowerCase().includes(q));
    return { chunks: hits.length ? hits : SEED.chunks };
  }

  const car = await resolveCar(db, carQuery);
  if (!car) return { found: false };
  const variant = await getVariant(db, car.id);
  const specs = variant ? await getSpecs(db, variant.id) : null;
  const carName = `${car.make} ${car.model}${car.model_year ? ` (${car.model_year})` : ""}`;

  if (name === "get_part_facts") {
    const facts = partFacts(String(args.part), specs, variant);
    return { found: Object.keys(facts).length > 0, car: carName, part: args.part, facts, caveats: car.caveats };
  }
  if (name === "get_overview") {
    return { found: true, name: carName, generation: car.generation, status: car.current_status, summary: car.summary, caveats: car.caveats };
  }
  if (name === "get_performance" && variant) {
    if (db) {
      const { data } = await db.from("performance_tests").select("*").eq("variant_id", variant.id);
      if (data?.length) return { found: true, car: carName, tests: data };
    }
    const tests = SEED.perf.filter((p) => p.variant_id === variant.id);
    return { found: tests.length > 0, car: carName, tests };
  }
  if (name === "get_pricing" && variant) {
    if (db) {
      const { data } = await db.from("pricing_market").select("*").eq("variant_id", variant.id);
      if (data?.length) return { found: true, car: carName, pricing: data };
    }
    const pricing = SEED.pricing.filter((p) => p.variant_id === variant.id);
    return { found: pricing.length > 0, car: carName, pricing };
  }
  return { error: `unknown data tool ${name}` };
}

async function runAgent(body) {
  const llm = makeLLM();
  const db = makeDb();
  const car = body.context?.car || "911 GT3 RS";
  const model = process.env.ATLAS_MODEL || (process.env.FEATHERLESS_API_KEY ? "Qwen/Qwen2.5-7B-Instruct" : "gpt-4o-mini");

  const messages = [
    { role: "system", content: systemPrompt(car) },
    ...(body.history || []),
    { role: "user", content: body.message },
  ];

  const actions = [];
  const data = {};

  for (let step = 0; step < 2; step++) {
    const completion = await llm.chat.completions.create({
      model,
      temperature: 0.3,
      messages,
      tools: TOOLS,
      tool_choice: step === 0 ? "auto" : "none",
    });

    const choice = completion.choices[0]?.message;
    if (!choice?.tool_calls?.length) {
      return { speech: choice?.content || "Done.", actions, data };
    }

    messages.push(choice);

    for (const tc of choice.tool_calls) {
      const name = tc.function.name;
      let args = {};
      try { args = JSON.parse(tc.function.arguments || "{}"); } catch { /* */ }

      if (SCENE.has(name)) {
        actions.push({ tool: name, args });
        messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify({ status: "queued", tool: name }) });
      } else {
        const out = await runDataTool(db, name, args, car);
        data[name] = out;
        messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(out) });
      }
    }
  }

  const last = messages[messages.length - 1];
  if (last?.role === "assistant" && last.content) {
    return { speech: last.content, actions, data };
  }
  return { speech: "Done.", actions, data };
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!body?.message) return res.status(400).json({ error: "`message` required" });
    const response = await runAgent(body);
    return res.status(200).json(response);
  } catch (err) {
    console.error("[api/agent]", err);
    return res.status(500).json({ error: "agent failed", detail: String(err.message || err) });
  }
}
