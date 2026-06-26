// ─────────────────────────────────────────────────────────────────────────────
// Data tools — the agent's verified memory (Blueprint schema).
//
// kind:"data" → run on the SERVER, results fed back to the model so every number
// it speaks is DB-sourced. The model is instructed to say "not confirmed in the
// data" rather than invent anything a tool didn't return.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CarRecord,
  SpecRecord,
  ToolContext,
  ToolDefinition,
  VariantRecord,
} from "../types.ts";

// The car shown in the 3D viewer by default. Override via context.car.
const DEFAULT_CAR = "911 GT3 RS";

async function resolve(ctx: ToolContext, carQuery?: string) {
  const q = carQuery || (ctx.request.context?.car as string) || DEFAULT_CAR;
  const car = await ctx.data.findCar(q);
  if (!car) return { car: null, variant: null, specs: null };
  const variant = await ctx.data.getPrimaryVariant(car.id);
  const specs = variant ? await ctx.data.getSpecs(variant.id) : null;
  return { car, variant, specs };
}

function carName(c: CarRecord): string {
  return `${c.make} ${c.model}${c.modelYear ? ` (${c.modelYear})` : ""}`;
}
function put(o: Record<string, unknown>, k: string, v: unknown) {
  if (v !== undefined && v !== null && v !== "") o[k] = v;
}

// Map a 3D part → the verified spec fields that describe it.
function partFacts(part: string, s: SpecRecord | null, v: VariantRecord | null) {
  const f: Record<string, unknown> = {};
  const sp = s ?? ({} as SpecRecord);
  switch (part) {
    case "engine":
      put(f, "engine", sp.engine);
      put(f, "displacement", sp.displacementLiters && `${sp.displacementLiters} L`);
      put(f, "aspiration", sp.aspiration);
      put(f, "hybrid", sp.hybridSystem);
      put(f, "horsepower", sp.horsepowerHp && `${sp.horsepowerHp} hp`);
      put(f, "torque", sp.torqueLbFt && `${sp.torqueLbFt} lb-ft`);
      break;
    case "exhaust":
      put(f, "aspiration", sp.aspiration);
      put(f, "engine", sp.engine);
      break;
    case "brakes":
      put(f, "front", sp.brakeFront);
      put(f, "rear", sp.brakeRear);
      break;
    case "suspension":
      put(f, "suspension", sp.suspension);
      break;
    case "wheels":
      put(f, "tireFront", sp.tireFront);
      put(f, "tireRear", sp.tireRear);
      break;
    case "transmission":
      put(f, "transmission", v?.transmission);
      put(f, "drivetrain", v?.drivetrain);
      break;
    case "body":
      put(f, "length", sp.lengthIn && `${sp.lengthIn} in`);
      put(f, "width", sp.widthIn && `${sp.widthIn} in`);
      put(f, "height", sp.heightIn && `${sp.heightIn} in`);
      put(f, "weight", sp.weightKg && `${sp.weightKg} kg`);
      break;
    case "interior":
      put(f, "seats", v?.seats);
      put(f, "bodyStyle", v?.bodyStyle);
      break;
  }
  return f;
}

export const knowledgeTools: ToolDefinition[] = [
  {
    name: "get_part_facts",
    kind: "data",
    description:
      "Verified specs for a specific part of the current car (engine, brakes, " +
      "suspension, wheels, transmission, body, interior, exhaust). Call this " +
      "before explaining or showing specs for any part on screen.",
    parameters: {
      part: { type: "string", description: "Part name, e.g. 'engine', 'brakes'.", required: true },
      car: { type: "string", description: "Optional car name; defaults to the car on screen." },
    },
    execute: async (args, ctx) => {
      const { car, variant, specs } = await resolve(ctx, args.car as string | undefined);
      if (!car) return { found: false, part: args.part };
      const facts = partFacts(String(args.part), specs, variant);
      return {
        found: Object.keys(facts).length > 0,
        car: carName(car),
        part: args.part,
        facts,
        caveats: car.caveats,
      };
    },
  },
  {
    name: "get_overview",
    kind: "data",
    description: "Identity + summary of the current (or named) car: make, model, generation, year, status, production, caveats.",
    parameters: { car: { type: "string", description: "Optional car name; defaults to the car on screen." } },
    execute: async (args, ctx) => {
      const { car, variant } = await resolve(ctx, args.car as string | undefined);
      if (!car) return { found: false };
      return {
        found: true, name: carName(car), generation: car.generation, status: car.currentStatus,
        production: car.productionCount, years: [car.productionStartYear, car.productionEndYear],
        summary: car.summary, caveats: car.caveats,
        variant: variant ? { name: variant.variantName, drivetrain: variant.drivetrain, transmission: variant.transmission } : null,
      };
    },
  },
  {
    name: "get_performance",
    kind: "data",
    description: "Verified performance figures (0-60, quarter mile, top speed, braking, lap times) for the current car, labeled official vs third-party.",
    parameters: { car: { type: "string", description: "Optional car name; defaults to the car on screen." } },
    execute: async (args, ctx) => {
      const { car, variant } = await resolve(ctx, args.car as string | undefined);
      if (!car || !variant) return { found: false };
      const perf = await ctx.data.getPerformance(variant.id);
      return { found: perf.length > 0, car: carName(car), tests: perf };
    },
  },
  {
    name: "get_pricing",
    kind: "data",
    description: "Verified pricing/market data (MSRP, market estimates, auction sales) for the current car.",
    parameters: { car: { type: "string", description: "Optional car name; defaults to the car on screen." } },
    execute: async (args, ctx) => {
      const { car, variant } = await resolve(ctx, args.car as string | undefined);
      if (!car || !variant) return { found: false };
      const pricing = await ctx.data.getPricing(variant.id);
      return { found: pricing.length > 0, car: carName(car), pricing };
    },
  },
  {
    name: "get_ownership",
    kind: "data",
    description: "Warranty, maintenance, recalls, safety ratings and practicality notes for the current car.",
    parameters: { car: { type: "string", description: "Optional car name; defaults to the car on screen." } },
    execute: async (args, ctx) => {
      const { car, variant } = await resolve(ctx, args.car as string | undefined);
      if (!car || !variant) return { found: false };
      const items = await ctx.data.getOwnership(variant.id);
      return { found: items.length > 0, car: carName(car), items };
    },
  },
  {
    name: "compare_cars",
    kind: "data",
    description: "Compare verified specs of two cars side by side. Use for 'how does X compare to Y'.",
    parameters: {
      car_a: { type: "string", description: "First car.", required: true },
      car_b: { type: "string", description: "Second car.", required: true },
    },
    execute: async (args, ctx) => {
      const side = async (q: string) => {
        const { car, variant, specs } = await resolve(ctx, q);
        if (!car) return { found: false, query: q };
        return { found: true, name: carName(car), drivetrain: variant?.drivetrain, transmission: variant?.transmission,
          engine: specs?.engine, horsepower: specs?.horsepowerHp, torqueLbFt: specs?.torqueLbFt,
          weightKg: specs?.weightKg };
      };
      return { a: await side(String(args.car_a)), b: await side(String(args.car_b)) };
    },
  },
  {
    name: "search_knowledge",
    kind: "data",
    description: "Search verified research notes (overviews, caveats, records) for facts not in the structured tables. Use for open questions and to confirm caveats.",
    parameters: { query: { type: "string", description: "What to look up.", required: true } },
    execute: async (args, ctx) => {
      const { car } = await resolve(ctx);
      const chunks = await ctx.data.searchKnowledge(String(args.query), car?.id);
      return { chunks };
    },
  },
  {
    name: "find_car",
    kind: "data",
    description: "Resolve a car by name and return its identity. Use when the user asks about a different car than the one on screen.",
    parameters: { query: { type: "string", description: "Car name, e.g. 'LaFerrari'.", required: true } },
    execute: async (args, ctx) => {
      const car = await ctx.data.findCar(String(args.query));
      return car ? { found: true, name: carName(car), summary: car.summary, status: car.currentStatus, caveats: car.caveats } : { found: false };
    },
  },
];
