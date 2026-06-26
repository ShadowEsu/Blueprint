// ─────────────────────────────────────────────────────────────────────────────
// Atlas AI — shared contract
//
// This file is the single source of truth for the "shape" of everything that
// crosses a boundary: Flutter <-> Edge Function, and LLM <-> tools.
//
// If you only read one file to understand the system, read this one.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A command the CLIENT (Flutter / Three.js scene) should execute.
 * The agent never runs these itself — it just decides which ones to emit.
 * Example: { tool: "focus_camera", args: { target: "rear" } }
 */
export interface SceneAction {
  tool: string;
  args: Record<string, unknown>;
}

/** One turn of prior conversation, sent up by the client for context. */
export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/** Whatever the app knows about the current scene right now. Free-form. */
export interface AgentContext {
  carId?: string;
  selectedPart?: string;
  mode?: string; // "learn" | "builder" | "designer" | ...
  paint?: string;
  [key: string]: unknown;
}

/** Request body Flutter POSTs to the edge function. */
export interface AgentRequest {
  message: string;
  history?: ChatTurn[];
  context?: AgentContext;
}

/** What the edge function returns. This is the whole "AI output" contract. */
export interface AgentResponse {
  /** What Atlas says out loud / shows in the bubble. Keep it short. */
  speech: string;
  /** Ordered scene commands for Flutter to run (camera, highlight, explode…). */
  actions: SceneAction[];
  /** Structured payloads gathered from data tools, keyed by tool name.
   *  Use these to render rich cards (specs, upgrade lists) without re-querying. */
  data: Record<string, unknown>;
}

// ── Tool definitions ─────────────────────────────────────────────────────────

export type ToolKind =
  /** Emitted to the client as a SceneAction. Has no server-side execute(). */
  | "scene"
  /** Runs on the server (e.g. queries Supabase), result fed back to the model. */
  | "data";

/** A minimal JSON-schema-ish description of one tool parameter. */
export interface ToolParam {
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  /** Constrain to a fixed set of values (great for part/camera names). */
  enum?: string[];
  /** For type: "array". */
  items?: { type: string };
  required?: boolean;
}

/** Context handed to a data tool's execute() function. */
export interface ToolContext {
  data: DataSource;
  request: AgentRequest;
}

/**
 * THE extension point. Adding a feature (engines, brakes, paint shop, …) means
 * adding one of these and registering it. Nothing else in the system changes.
 */
export interface ToolDefinition {
  name: string;
  description: string;
  kind: ToolKind;
  parameters: Record<string, ToolParam>;
  /** Required for kind:"data", ignored for kind:"scene". */
  execute?: (
    args: Record<string, unknown>,
    ctx: ToolContext,
  ) => Promise<unknown>;
}

// ── Data source — Blueprint verified-knowledge schema ────────────────────────
// Mirrors github.com/ShadowEsu/Blueprint: cars → variants → specs / performance
// / pricing / ownership / research_chunks. All facts come from here, not the LLM.

export interface CarRecord {
  id: string;
  make: string;
  model: string;
  generation?: string;
  modelYear?: number;
  productionStartYear?: number;
  productionEndYear?: number;
  productionCount?: number;
  currentStatus?: string;
  summary?: string;
  caveats?: string;
}

export interface VariantRecord {
  id: string;
  carId: string;
  variantName: string;
  bodyStyle?: string;
  drivetrain?: string;
  transmission?: string;
  seats?: number;
  description?: string;
  isPrimary?: boolean;
}

export interface SpecRecord {
  variantId: string;
  engine?: string;
  displacementLiters?: number;
  aspiration?: string;
  hybridSystem?: string;
  horsepowerHp?: number;
  torqueLbFt?: number;
  torqueNm?: number;
  weightLb?: number;
  weightKg?: number;
  lengthIn?: number;
  widthIn?: number;
  heightIn?: number;
  wheelbaseIn?: number;
  tireFront?: string;
  tireRear?: string;
  brakeFront?: string;
  brakeRear?: string;
  suspension?: string;
  notes?: string;
}

export interface PerfRecord {
  variantId: string;
  testType: string;
  sourceType: string; // official | third_party | estimated | unverified
  sourceName?: string;
  zeroTo60MphSec?: number;
  zeroTo100KmhSec?: number;
  quarterMileSec?: number;
  topSpeedMph?: number;
  topSpeedKmh?: number;
  braking600Ft?: number;
  lateralG?: number;
  notes?: string;
}

export interface PricingRecord {
  variantId: string;
  priceType: string; // launch_msrp | market_estimate | auction_sale | ...
  amount?: number;
  currency?: string;
  marketRegion?: string;
  context?: string;
  sourceName?: string;
}

export interface OwnershipRecord {
  variantId: string;
  category: string; // warranty | maintenance | recall | safety | reliability | practicality
  title: string;
  details?: string;
  severity?: string;
  isPublicRatingAvailable?: boolean;
}

export interface ResearchChunk {
  chunkTitle?: string;
  chunkText: string;
  chunkType?: string;
}

/**
 * Abstraction over "where verified car data comes from". Backed by the Blueprint
 * Supabase schema in prod, by seed JSON when no DB is configured — so the demo
 * works on a fresh clone. Every method returns DB-sourced facts only.
 */
export interface DataSource {
  /** Resolve a car by free text ("GT3 RS", "LaFerrari"). */
  findCar(query: string): Promise<CarRecord | null>;
  getPrimaryVariant(carId: string): Promise<VariantRecord | null>;
  getSpecs(variantId: string): Promise<SpecRecord | null>;
  getPerformance(variantId: string): Promise<PerfRecord[]>;
  getPricing(variantId: string): Promise<PricingRecord[]>;
  getOwnership(variantId: string): Promise<OwnershipRecord[]>;
  /** Verified prose snippets (overview, caveats, records). */
  searchKnowledge(query: string, carId?: string): Promise<ResearchChunk[]>;
}
