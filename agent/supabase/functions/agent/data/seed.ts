// ─────────────────────────────────────────────────────────────────────────────
// Seed data — Blueprint-shaped, so the agent runs with ZERO database configured.
//
// Competition demo slice mirrored from Blueprint-main/supabase_schema.sql.
// Live Supabase rows supersede these automatically when credentials are present.
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
  {
    id: "car_chiron", make: "Bugatti", model: "Chiron", generation: "Chiron Family",
    modelYear: 2024, productionStartYear: 2016, productionEndYear: 2024, productionCount: 500,
    currentStatus: "End of Production",
    summary: "Final-generation quad-turbo W16 hypercar. Total Chiron-family production was capped at 500 units.",
    caveats: "2024 is the final model year. Bugatti transitioned to the Tourbillon platform; no 2025 or 2026 Chiron exists.",
  },
  {
    id: "car_laferrari", make: "Ferrari", model: "LaFerrari", generation: "F150",
    modelYear: 2015, productionStartYear: 2013, productionEndYear: 2016, productionCount: 499,
    currentStatus: "Discontinued",
    summary: "Ferrari's first hybrid hypercar, pairing a 6.3L naturally aspirated V12 with HY-KERS electric assistance.",
    caveats: "The coupe is no longer in production; all 499 coupes were allocated before production ended.",
  },
  {
    id: "car_svj", make: "Lamborghini", model: "Aventador SVJ", generation: "Aventador",
    modelYear: 2022, productionStartYear: 2018, productionEndYear: 2022, productionCount: 900,
    currentStatus: "Discontinued",
    summary: "Track-focused Aventador with a naturally aspirated 6.5L V12 and ALA active aerodynamics.",
    caveats: "No 2026 Aventador SVJ exists. The Aventador lineup ended in 2022 and was replaced by the Revuelto.",
  },
];

export const SEED_VARIANTS: VariantRecord[] = [
  { id: "var_gt3rs", carId: "car_gt3rs", variantName: "GT3 RS", bodyStyle: "Coupe", drivetrain: "RWD", transmission: "7-Speed PDK", seats: 2, description: "Track-focused NA GT3 RS with 518 hp.", isPrimary: true },
  { id: "var_turbos", carId: "car_turbos", variantName: "Turbo S Coupe", bodyStyle: "Coupe", drivetrain: "AWD", transmission: "8-Speed PDK", seats: 4, description: "Standard Turbo S with 650 hp.", isPrimary: true },
  { id: "var_chiron", carId: "car_chiron", variantName: "Chiron Sport", bodyStyle: "Coupe", drivetrain: "AWD", transmission: "7-Speed DSG", seats: 2, description: "Quad-turbo W16 Chiron Sport.", isPrimary: true },
  { id: "var_laferrari", carId: "car_laferrari", variantName: "LaFerrari Coupe", bodyStyle: "Coupe", drivetrain: "RWD", transmission: "7-Speed DCT", seats: 2, description: "V12 HY-KERS hybrid hypercar.", isPrimary: true },
  { id: "var_svj", carId: "car_svj", variantName: "Aventador SVJ Coupe", bodyStyle: "Coupe", drivetrain: "AWD", transmission: "7-Speed ISR", seats: 2, description: "ALA-equipped V12 flagship.", isPrimary: true },
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
  {
    variantId: "var_chiron", engine: "8.0L Quad-Turbo W16", displacementLiters: 8.0,
    aspiration: "Quad-Turbo", horsepowerHp: 1479, torqueLbFt: 1180, torqueNm: 1600,
    weightLb: 4400, weightKg: 1995, lengthIn: 178.0, widthIn: 78.7, heightIn: 47.2, wheelbaseIn: 106.3,
    tireFront: "285/30ZR20", tireRear: "355/25ZR21",
    brakeFront: "420mm Carbon-Ceramic", brakeRear: "420mm Carbon-Ceramic",
    suspension: "Adaptive dampers with hydraulic anti-roll system",
    notes: "Blueprint-main demo data sourced from published Bugatti specifications.",
  },
  {
    variantId: "var_laferrari", engine: "6.3L V12 + Electric Motor", displacementLiters: 6.3,
    aspiration: "Naturally Aspirated", hybridSystem: "HY-KERS", horsepowerHp: 949, torqueLbFt: 664, torqueNm: 900,
    weightLb: 3480, weightKg: 1580, lengthIn: 185.0, widthIn: 77.2, heightIn: 43.9, wheelbaseIn: 104.3,
    tireFront: "265/30ZR19", tireRear: "345/30ZR20",
    brakeFront: "398mm Carbon-Ceramic", brakeRear: "380mm Carbon-Ceramic",
    suspension: "Pushrod suspension with adaptive dampers",
    notes: "Blueprint-main demo data sourced from published Ferrari specifications.",
  },
  {
    variantId: "var_svj", engine: "6.5L Naturally Aspirated V12", displacementLiters: 6.5,
    aspiration: "Naturally Aspirated", horsepowerHp: 759, torqueLbFt: 531, torqueNm: 720,
    weightLb: 3470, weightKg: 1575, lengthIn: 182.0, widthIn: 82.0, heightIn: 46.0, wheelbaseIn: 106.3,
    tireFront: "255/30ZR20", tireRear: "355/25ZR21",
    brakeFront: "400mm Carbon-Ceramic", brakeRear: "380mm Carbon-Ceramic",
    suspension: "Pushrod suspension with magnetorheological dampers",
    notes: "Blueprint-main demo data sourced from published Lamborghini specifications.",
  },
];

export const SEED_PERF: PerfRecord[] = [
  { variantId: "var_gt3rs", testType: "Acceleration Test", sourceType: "official", sourceName: "Porsche", zeroTo60MphSec: 3.0, quarterMileSec: 11.3, topSpeedMph: 184, topSpeedKmh: 296, braking600Ft: 107, lateralG: 1.10, notes: "Weissach package is 0.2s faster 0-60." },
  { variantId: "var_gt3rs", testType: "Nürburgring Lap", sourceType: "third_party", sourceName: "Porsche", notes: "6:43.300 at Nürburgring Nordschleife with Weissach package, Cup 2 R tyres." },
  { variantId: "var_turbos", testType: "Acceleration Test", sourceType: "official", sourceName: "Porsche", zeroTo60MphSec: 2.6, topSpeedMph: 205, topSpeedKmh: 330, braking600Ft: 104, lateralG: 1.05, notes: "0-60 under 2.6s with rollout." },
  { variantId: "var_chiron", testType: "Top Speed", sourceType: "official", sourceName: "Bugatti", zeroTo60MphSec: 2.4, topSpeedMph: 261, topSpeedKmh: 420, notes: "Electronically limited production figure." },
  { variantId: "var_laferrari", testType: "Acceleration Test", sourceType: "official", sourceName: "Ferrari", zeroTo60MphSec: 2.6, topSpeedMph: 217, topSpeedKmh: 350, notes: "Published manufacturer performance figures." },
  { variantId: "var_svj", testType: "Acceleration Test", sourceType: "official", sourceName: "Lamborghini", zeroTo60MphSec: 2.8, topSpeedMph: 217, topSpeedKmh: 350, notes: "Published manufacturer performance figures." },
];

export const SEED_PRICING: PricingRecord[] = [
  { variantId: "var_gt3rs", priceType: "launch_msrp", amount: 223800, currency: "USD", marketRegion: "USA", context: "Base price before options", sourceName: "Porsche USA" },
  { variantId: "var_turbos", priceType: "launch_msrp", amount: 230400, currency: "USD", marketRegion: "USA", context: "Base price before options", sourceName: "Porsche USA" },
  { variantId: "var_laferrari", priceType: "launch_msrp", amount: 1416362, currency: "USD", marketRegion: "USA", context: "Original launch price context", sourceName: "Ferrari" },
  { variantId: "var_svj", priceType: "launch_msrp", amount: 517770, currency: "USD", marketRegion: "USA", context: "Base coupe price before options", sourceName: "Lamborghini" },
];

export const SEED_OWNERSHIP: OwnershipRecord[] = [
  { variantId: "var_gt3rs", category: "warranty", title: "New Car Warranty", details: "4 years / 50,000 miles bumper-to-bumper." },
  { variantId: "var_gt3rs", category: "practicality", title: "Daily Drivability", details: "Not recommended for daily driving. Stiff suspension, limited cargo, high running costs." },
  { variantId: "var_gt3rs", category: "safety", title: "Crash Test Rating", details: "No public crash-test rating found. Exotics aren't typically tested by NHTSA/IIHS.", isPublicRatingAvailable: false },
  { variantId: "var_chiron", category: "safety", title: "Crash Test Rating", details: "No public crash-test rating found for this limited-production hypercar.", isPublicRatingAvailable: false },
  { variantId: "var_laferrari", category: "practicality", title: "Production context", details: "Limited-production two-seat hybrid hypercar; no normal series-production ownership profile applies." },
  { variantId: "var_svj", category: "safety", title: "Crash Test Rating", details: "No public NHTSA or IIHS crash-test rating found.", isPublicRatingAvailable: false },
];

export const SEED_CHUNKS: ResearchChunk[] = [
  { chunkTitle: "GT3 RS Discontinuation", chunkType: "caveat", chunkText: "The Porsche 911 GT3 RS (992.1) was discontinued in 2024. Production ran 2022–2024, ~3,000 units. There is NO 2025 or 2026 GT3 RS." },
  { chunkTitle: "GT3 RS Aero", chunkType: "specs", chunkText: "The GT3 RS uses a swan-neck DRS rear wing and active aerodynamics, generating substantial downforce — among the highest of any road-legal 911." },
  { chunkTitle: "Chiron end of production", chunkType: "caveat", chunkText: "The Bugatti Chiron family ended production in 2024 after 500 total units. No 2025 or 2026 Chiron exists." },
  { chunkTitle: "LaFerrari hybrid system", chunkType: "specs", chunkText: "LaFerrari combines a 6.3L naturally aspirated V12 with Ferrari's HY-KERS electric system." },
  { chunkTitle: "Aventador SVJ caveat", chunkType: "caveat", chunkText: "Aventador SVJ production ended in 2022. It should not be described as a current 2026 model." },
];
