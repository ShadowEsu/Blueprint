// ─────────────────────────────────────────────────────────────────────────────
// DataSource — Blueprint schema, one interface, two backends.
//
//   • SUPABASE_URL + key present → query the live Blueprint tables.
//   • Otherwise                  → seed.ts (a GT3 RS + Turbo S slice).
//
// Every Supabase method degrades to seed on error, so a half-set-up DB never
// breaks the demo — it just falls back to verified seed facts.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import type {
  CarRecord,
  DataSource,
  OwnershipRecord,
  PerfRecord,
  PricingRecord,
  ResearchChunk,
  SpecRecord,
  VariantRecord,
} from "../types.ts";
import {
  SEED_CARS,
  SEED_CHUNKS,
  SEED_OWNERSHIP,
  SEED_PERF,
  SEED_PRICING,
  SEED_SPECS,
  SEED_VARIANTS,
} from "./seed.ts";

export function makeDataSource(): DataSource {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ||
    Deno.env.get("SUPABASE_ANON_KEY");
  const supabase = url && key ? createClient(url, key) : null;
  if (!supabase) {
    console.log("[data] no Supabase env — using seed data");
    return seedSource();
  }
  console.log("[data] using live Supabase (Blueprint schema)");
  return supabaseSource(supabase);
}

// ── Seed-backed ──────────────────────────────────────────────────────────────

function seedSource(): DataSource {
  return {
    findCar(query) {
      const q = query.toLowerCase();
      const car = SEED_CARS.find((c) =>
        `${c.make} ${c.model}`.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        q.includes(c.model.toLowerCase().replace("911 ", ""))
      ) ?? null;
      return Promise.resolve(car);
    },
    getPrimaryVariant(carId) {
      return Promise.resolve(SEED_VARIANTS.find((v) => v.carId === carId && v.isPrimary) ?? null);
    },
    getSpecs(variantId) {
      return Promise.resolve(SEED_SPECS.find((s) => s.variantId === variantId) ?? null);
    },
    getPerformance(variantId) {
      return Promise.resolve(SEED_PERF.filter((p) => p.variantId === variantId));
    },
    getPricing(variantId) {
      return Promise.resolve(SEED_PRICING.filter((p) => p.variantId === variantId));
    },
    getOwnership(variantId) {
      return Promise.resolve(SEED_OWNERSHIP.filter((o) => o.variantId === variantId));
    },
    searchKnowledge(query) {
      const q = query.toLowerCase();
      const hits = SEED_CHUNKS.filter((c) =>
        c.chunkText.toLowerCase().includes(q) || (c.chunkTitle ?? "").toLowerCase().includes(q)
      );
      return Promise.resolve(hits.length ? hits : SEED_CHUNKS);
    },
  };
}

// ── Supabase-backed (Blueprint tables) ───────────────────────────────────────

function supabaseSource(db: SupabaseClient): DataSource {
  const seed = seedSource();
  return {
    async findCar(query) {
      // The client sends a display name such as "Porsche 911 GT3 RS". Strip a
      // leading make but preserve model tokens such as "911" for a reliable match.
      const q = query.replace(/^(Porsche|Ferrari|Lamborghini|Bugatti)\s+/i, "").trim();
      const { data, error } = await db.from("cars").select("*").ilike("model", `%${q}%`).limit(1);
      if (error) { console.error("[data] findCar", error.message); return seed.findCar(query); }
      if (data && data.length) return rowToCar(data[0]);
      const make = query.trim().split(/\s+/)[0];
      const alt = await db.from("cars").select("*").ilike("make", `%${make}%`).limit(1);
      return alt.data && alt.data.length ? rowToCar(alt.data[0]) : seed.findCar(query);
    },
    async getPrimaryVariant(carId) {
      const { data, error } = await db.from("car_variants").select("*")
        .eq("car_id", carId).order("is_primary_variant", { ascending: false }).limit(1);
      if (error) { console.error("[data] variant", error.message); return null; }
      return data && data.length ? rowToVariant(data[0]) : null;
    },
    async getSpecs(variantId) {
      const { data, error } = await db.from("car_specs").select("*").eq("variant_id", variantId).limit(1);
      if (error) { console.error("[data] specs", error.message); return null; }
      return data && data.length ? rowToSpec(data[0]) : null;
    },
    async getPerformance(variantId) {
      const { data, error } = await db.from("performance_tests").select("*").eq("variant_id", variantId);
      if (error || !data) return [];
      return data.map(rowToPerf);
    },
    async getPricing(variantId) {
      const { data, error } = await db.from("pricing_market").select("*").eq("variant_id", variantId);
      if (error || !data) return [];
      return data.map(rowToPricing);
    },
    async getOwnership(variantId) {
      const { data, error } = await db.from("ownership_safety").select("*").eq("variant_id", variantId);
      if (error || !data) return [];
      return data.map(rowToOwnership);
    },
    async searchKnowledge(query, carId) {
      // text search (no embeddings needed). Vector RPC match_car_research_chunks
      // is available in the schema if you later want semantic search.
      let q = db.from("research_chunks").select("chunk_title, chunk_text, chunk_type")
        .or(`chunk_text.ilike.%${query}%,chunk_title.ilike.%${query}%`).limit(6);
      if (carId) q = q.eq("car_id", carId);
      const { data, error } = await q;
      if (error || !data || !data.length) return seed.searchKnowledge(query, carId);
      // deno-lint-ignore no-explicit-any
      return data.map((r: any) => ({ chunkTitle: r.chunk_title, chunkText: r.chunk_text, chunkType: r.chunk_type }));
    },
  };
}

// ── Row mappers (snake_case → camelCase) ─────────────────────────────────────
/* deno-lint-ignore-file no-explicit-any */
// deno-lint-ignore no-explicit-any
function rowToCar(r: any): CarRecord {
  return {
    id: r.id, make: r.make, model: r.model, generation: r.generation ?? undefined,
    modelYear: r.model_year ?? undefined, productionStartYear: r.production_start_year ?? undefined,
    productionEndYear: r.production_end_year ?? undefined, productionCount: r.production_count ?? undefined,
    currentStatus: r.current_status ?? undefined, summary: r.summary ?? undefined, caveats: r.caveats ?? undefined,
  };
}
// deno-lint-ignore no-explicit-any
function rowToVariant(r: any): VariantRecord {
  return {
    id: r.id, carId: r.car_id, variantName: r.variant_name, bodyStyle: r.body_style ?? undefined,
    drivetrain: r.drivetrain ?? undefined, transmission: r.transmission ?? undefined,
    seats: r.seats ?? undefined, description: r.description ?? undefined, isPrimary: r.is_primary_variant ?? undefined,
  };
}
// deno-lint-ignore no-explicit-any
function rowToSpec(r: any): SpecRecord {
  return {
    variantId: r.variant_id, engine: r.engine ?? undefined, displacementLiters: num(r.displacement_liters),
    aspiration: r.aspiration ?? undefined, hybridSystem: r.hybrid_system ?? undefined,
    horsepowerHp: num(r.horsepower_hp), torqueLbFt: num(r.torque_lb_ft), torqueNm: num(r.torque_nm),
    weightLb: num(r.weight_lb), weightKg: num(r.weight_kg),
    lengthIn: num(r.length_in), widthIn: num(r.width_in), heightIn: num(r.height_in), wheelbaseIn: num(r.wheelbase_in),
    tireFront: r.tire_front ?? undefined, tireRear: r.tire_rear ?? undefined,
    brakeFront: r.brake_front ?? undefined, brakeRear: r.brake_rear ?? undefined,
    suspension: r.suspension ?? undefined, notes: r.notes ?? undefined,
  };
}
// deno-lint-ignore no-explicit-any
function rowToPerf(r: any): PerfRecord {
  return {
    variantId: r.variant_id, testType: r.test_type, sourceType: r.source_type, sourceName: r.source_name ?? undefined,
    zeroTo60MphSec: num(r.zero_to_60_mph_sec), zeroTo100KmhSec: num(r.zero_to_100_kmh_sec),
    quarterMileSec: num(r.quarter_mile_sec), topSpeedMph: num(r.top_speed_mph), topSpeedKmh: num(r.top_speed_kmh),
    braking600Ft: num(r.braking_60_0_ft), lateralG: num(r.lateral_g), notes: r.notes ?? undefined,
  };
}
// deno-lint-ignore no-explicit-any
function rowToPricing(r: any): PricingRecord {
  return {
    variantId: r.variant_id, priceType: r.price_type, amount: num(r.amount), currency: r.currency ?? undefined,
    marketRegion: r.market_region ?? undefined, context: r.context ?? undefined, sourceName: r.source_name ?? undefined,
  };
}
// deno-lint-ignore no-explicit-any
function rowToOwnership(r: any): OwnershipRecord {
  return {
    variantId: r.variant_id, category: r.category, title: r.title, details: r.details ?? undefined,
    severity: r.severity ?? undefined, isPublicRatingAvailable: r.is_public_rating_available ?? undefined,
  };
}
// deno-lint-ignore no-explicit-any
function num(v: any): number | undefined { return v === null || v === undefined ? undefined : Number(v); }
