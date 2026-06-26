// ─────────────────────────────────────────────────────────────────────────────
// Seed data — Blueprint-shaped, so the agent runs with ZERO database configured.
//
// A small slice of github.com/ShadowEsu/Blueprint's sample data (GT3 RS = the car
// in the 3D viewer, plus the Turbo S so "compare" works offline). Once you run
// supabase_schema.sql, the live DB supersedes this automatically.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CarRecord,
  OwnershipRecord,
  PerfRecord,
  PricingRecord,
  ResearchChunk,
  SpecRecord,
  VariantRecord,
} from "../types.ts";

export const SEED_CARS: CarRecord[] = [
  {
    id: "car_gt3rs", make: "Porsche", model: "911 GT3 RS", generation: "992.1",
    modelYear: 2024, productionStartYear: 2022, productionEndYear: 2024, productionCount: 3000,
    currentStatus: "Discontinued",
    summary: "Track-focused naturally aspirated 911 with a 4.0L flat-6 producing 518 hp. Extensive aero package with DRS and active suspension.",
    caveats: "GT3 RS is discontinued for 2025. No 2025 or 2026 model confirmed. The 992.1 generation has ended.",
  },
  {
    id: "car_turbos", make: "Porsche", model: "911 Turbo S", generation: "992.1",
    modelYear: 2026, productionStartYear: 2024, productionCount: 5000, currentStatus: "In Production",
    summary: "Flagship turbocharged 911 with a 3.7L twin-turbo flat-6 producing 650 hp. AWD, 8-speed PDK.",
    caveats: "2026 model-year details may vary from final production specs.",
  },
];

export const SEED_VARIANTS: VariantRecord[] = [
  { id: "var_gt3rs", carId: "car_gt3rs", variantName: "GT3 RS", bodyStyle: "Coupe", drivetrain: "RWD", transmission: "7-Speed PDK", seats: 2, description: "Track-focused NA GT3 RS with 518 hp.", isPrimary: true },
  { id: "var_turbos", carId: "car_turbos", variantName: "Turbo S Coupe", bodyStyle: "Coupe", drivetrain: "AWD", transmission: "8-Speed PDK", seats: 4, description: "Standard Turbo S with 650 hp.", isPrimary: true },
];

export const SEED_SPECS: SpecRecord[] = [
  {
    variantId: "var_gt3rs", engine: "4.0L Naturally Aspirated Flat-6", displacementLiters: 4.0,
    aspiration: "Naturally Aspirated", horsepowerHp: 518, torqueLbFt: 343, torqueNm: 465,
    weightLb: 3170, weightKg: 1440, lengthIn: 180.5, widthIn: 77.5, heightIn: 49.9, wheelbaseIn: 103.0,
    tireFront: "275/35ZR20", tireRear: "335/30ZR21",
    brakeFront: "410mm Ceramic Composite", brakeRear: "390mm Ceramic Composite",
    suspension: "PASM Sport with adaptive dampers",
    notes: "Official Porsche specifications. Weissach package reduces weight by 49 lbs.",
  },
  {
    variantId: "var_turbos", engine: "3.7L Twin-Turbo Flat-6", displacementLiters: 3.7,
    aspiration: "Twin-Turbo", horsepowerHp: 650, torqueLbFt: 590, torqueNm: 800,
    weightLb: 3470, weightKg: 1572, lengthIn: 178.0, widthIn: 72.9, heightIn: 51.1, wheelbaseIn: 100.4,
    tireFront: "255/35ZR20", tireRear: "315/30ZR21",
    brakeFront: "410mm Ceramic Composite", brakeRear: "410mm Ceramic Composite",
    suspension: "PASM Sport with lowered ride height",
    notes: "Official Porsche specifications.",
  },
];

export const SEED_PERF: PerfRecord[] = [
  { variantId: "var_gt3rs", testType: "Acceleration Test", sourceType: "official", sourceName: "Porsche", zeroTo60MphSec: 3.0, quarterMileSec: 11.3, topSpeedMph: 184, topSpeedKmh: 296, braking600Ft: 107, lateralG: 1.10, notes: "Weissach package is 0.2s faster 0-60." },
  { variantId: "var_gt3rs", testType: "Nürburgring Lap", sourceType: "third_party", sourceName: "Porsche", notes: "6:43.300 at Nürburgring Nordschleife with Weissach package, Cup 2 R tyres." },
  { variantId: "var_turbos", testType: "Acceleration Test", sourceType: "official", sourceName: "Porsche", zeroTo60MphSec: 2.6, topSpeedMph: 205, topSpeedKmh: 330, braking600Ft: 104, lateralG: 1.05, notes: "0-60 under 2.6s with rollout." },
];

export const SEED_PRICING: PricingRecord[] = [
  { variantId: "var_gt3rs", priceType: "launch_msrp", amount: 223800, currency: "USD", marketRegion: "USA", context: "Base price before options", sourceName: "Porsche USA" },
  { variantId: "var_turbos", priceType: "launch_msrp", amount: 230400, currency: "USD", marketRegion: "USA", context: "Base price before options", sourceName: "Porsche USA" },
];

export const SEED_OWNERSHIP: OwnershipRecord[] = [
  { variantId: "var_gt3rs", category: "warranty", title: "New Car Warranty", details: "4 years / 50,000 miles bumper-to-bumper." },
  { variantId: "var_gt3rs", category: "practicality", title: "Daily Drivability", details: "Not recommended for daily driving. Stiff suspension, limited cargo, high running costs." },
  { variantId: "var_gt3rs", category: "safety", title: "Crash Test Rating", details: "No public crash-test rating found. Exotics aren't typically tested by NHTSA/IIHS.", isPublicRatingAvailable: false },
];

export const SEED_CHUNKS: ResearchChunk[] = [
  { chunkTitle: "GT3 RS Discontinuation", chunkType: "caveat", chunkText: "The Porsche 911 GT3 RS (992.1) was discontinued in 2024. Production ran 2022–2024, ~3,000 units. There is NO 2025 or 2026 GT3 RS." },
  { chunkTitle: "GT3 RS Aero", chunkType: "specs", chunkText: "The GT3 RS uses a swan-neck DRS rear wing and active aerodynamics, generating substantial downforce — among the highest of any road-legal 911." },
];
