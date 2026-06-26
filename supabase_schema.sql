-- Exotic Car Assistant - Supabase Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- =========================
-- CARS
-- =========================

create table if not exists public.cars (
  id uuid primary key default uuid_generate_v4(),
  make text not null,
  model text not null,
  generation text,
  model_year int,
  production_start_year int,
  production_end_year int,
  production_count int,
  current_status text,
  summary text,
  caveats text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.car_variants (
  id uuid primary key default uuid_generate_v4(),
  car_id uuid not null references public.cars(id) on delete cascade,
  variant_name text not null,
  body_style text,
  drivetrain text,
  transmission text,
  seats int,
  description text,
  is_primary_variant boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- SPECS
-- =========================

create table if not exists public.car_specs (
  id uuid primary key default uuid_generate_v4(),
  variant_id uuid not null references public.car_variants(id) on delete cascade,

  engine text,
  displacement_liters numeric,
  aspiration text,
  hybrid_system text,
  horsepower_hp numeric,
  horsepower_ps numeric,
  torque_lb_ft numeric,
  torque_nm numeric,

  weight_lb numeric,
  weight_kg numeric,
  weight_type text,

  length_in numeric,
  width_in numeric,
  height_in numeric,
  wheelbase_in numeric,

  tire_front text,
  tire_rear text,
  brake_front text,
  brake_rear text,
  suspension text,

  source_confidence text default 'medium',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- PERFORMANCE
-- =========================

create table if not exists public.performance_tests (
  id uuid primary key default uuid_generate_v4(),
  variant_id uuid not null references public.car_variants(id) on delete cascade,

  test_type text not null,
  source_type text not null, -- official, third_party, estimated, unverified
  source_name text,

  zero_to_60_mph_sec numeric,
  zero_to_100_kmh_sec numeric,
  zero_to_100_mph_sec numeric,
  zero_to_200_kmh_sec numeric,
  zero_to_300_kmh_sec numeric,
  quarter_mile_sec numeric,
  quarter_mile_mph numeric,
  top_speed_mph numeric,
  top_speed_kmh numeric,
  braking_60_0_ft numeric,
  braking_70_0_ft numeric,
  lateral_g numeric,

  conditions text,
  tire text,
  notes text,
  confidence text default 'medium',
  created_at timestamptz default now()
);

-- =========================
-- TRACK RECORDS
-- =========================

create table if not exists public.track_records (
  id uuid primary key default uuid_generate_v4(),
  variant_id uuid not null references public.car_variants(id) on delete cascade,

  track_name text not null,
  lap_time text,
  lap_time_seconds numeric,
  driver text,
  tire text,
  package_or_options text,
  record_type text, -- official, third_party, rumored, unverified
  notes text,
  confidence text default 'medium',
  created_at timestamptz default now()
);

-- =========================
-- PRICING
-- =========================

create table if not exists public.pricing_market (
  id uuid primary key default uuid_generate_v4(),
  variant_id uuid not null references public.car_variants(id) on delete cascade,

  price_type text not null, -- launch_msrp, original_msrp, auction_sale, asking_price, market_estimate
  amount numeric,
  currency text default 'USD',
  market_region text,
  date_observed date,
  mileage text,
  context text,
  source_name text,
  confidence text default 'medium',
  created_at timestamptz default now()
);

-- =========================
-- COLORS / OPTIONS
-- =========================

create table if not exists public.colors_options (
  id uuid primary key default uuid_generate_v4(),
  variant_id uuid not null references public.car_variants(id) on delete cascade,

  item_type text not null, -- color, package, option, personalization_program
  name text not null,
  price numeric,
  currency text default 'USD',
  description text,
  is_factory_catalog boolean default false,
  is_personalization boolean default false,
  created_at timestamptz default now()
);

-- =========================
-- OWNERSHIP / SAFETY
-- =========================

create table if not exists public.ownership_safety (
  id uuid primary key default uuid_generate_v4(),
  variant_id uuid not null references public.car_variants(id) on delete cascade,

  category text not null, -- warranty, maintenance, recall, safety, reliability, practicality
  title text not null,
  details text,
  rating_value text,
  rating_source text,
  is_public_rating_available boolean,
  severity text,
  confidence text default 'medium',
  created_at timestamptz default now()
);

-- =========================
-- SOURCES
-- =========================

create table if not exists public.sources (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  url text,
  source_type text, -- official_manufacturer, government, magazine_test, auction, market_listing, secondary
  publisher text,
  date_published date,
  confidence text default 'medium',
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.fact_sources (
  id uuid primary key default uuid_generate_v4(),
  source_id uuid not null references public.sources(id) on delete cascade,
  table_name text not null,
  record_id uuid not null,
  fact_description text,
  created_at timestamptz default now()
);

-- =========================
-- AI RESEARCH CHUNKS
-- =========================

create table if not exists public.research_chunks (
  id uuid primary key default uuid_generate_v4(),
  car_id uuid references public.cars(id) on delete cascade,
  variant_id uuid references public.car_variants(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,

  chunk_title text,
  chunk_text text not null,
  chunk_type text, -- specs, pricing, track, safety, ownership, caveat, source
  metadata jsonb default '{}'::jsonb,

  -- 1536 is good if you use OpenAI text-embedding-3-small.
  -- Change this if your embedding model uses a different dimension.
  embedding vector(1536),

  created_at timestamptz default now()
);

-- =========================
-- INDEXES
-- =========================

create index if not exists idx_cars_make_model_year
on public.cars(make, model, model_year);

create index if not exists idx_car_variants_name
on public.car_variants(variant_name);

create index if not exists idx_research_chunks_car_id
on public.research_chunks(car_id);

create index if not exists idx_research_chunks_variant_id
on public.research_chunks(variant_id);

create index if not exists idx_research_chunks_metadata
on public.research_chunks using gin(metadata);

create index if not exists idx_research_chunks_embedding
on public.research_chunks
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- =========================
-- VECTOR SEARCH FUNCTION
-- =========================

create or replace function public.match_car_research_chunks(
  query_embedding vector(1536),
  match_count int default 8,
  filter_car_id uuid default null,
  filter_variant_id uuid default null
)
returns table (
  id uuid,
  car_id uuid,
  variant_id uuid,
  chunk_title text,
  chunk_text text,
  chunk_type text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    research_chunks.id,
    research_chunks.car_id,
    research_chunks.variant_id,
    research_chunks.chunk_title,
    research_chunks.chunk_text,
    research_chunks.chunk_type,
    research_chunks.metadata,
    1 - (research_chunks.embedding <=> query_embedding) as similarity
  from public.research_chunks
  where
    (filter_car_id is null or research_chunks.car_id = filter_car_id)
    and (filter_variant_id is null or research_chunks.variant_id = filter_variant_id)
  order by research_chunks.embedding <=> query_embedding
  limit match_count;
$$;

-- =========================
-- PUBLIC READ, PRIVATE WRITE
-- =========================

alter table public.cars enable row level security;
alter table public.car_variants enable row level security;
alter table public.car_specs enable row level security;
alter table public.performance_tests enable row level security;
alter table public.track_records enable row level security;
alter table public.pricing_market enable row level security;
alter table public.colors_options enable row level security;
alter table public.ownership_safety enable row level security;
alter table public.sources enable row level security;
alter table public.fact_sources enable row level security;
alter table public.research_chunks enable row level security;

create policy "Public read cars"
on public.cars for select
to anon, authenticated
using (true);

create policy "Public read car variants"
on public.car_variants for select
to anon, authenticated
using (true);

create policy "Public read specs"
on public.car_specs for select
to anon, authenticated
using (true);

create policy "Public read performance"
on public.performance_tests for select
to anon, authenticated
using (true);

create policy "Public read track records"
on public.track_records for select
to anon, authenticated
using (true);

create policy "Public read pricing"
on public.pricing_market for select
to anon, authenticated
using (true);

create policy "Public read colors options"
on public.colors_options for select
to anon, authenticated
using (true);

create policy "Public read ownership safety"
on public.ownership_safety for select
to anon, authenticated
using (true);

create policy "Public read sources"
on public.sources for select
to anon, authenticated
using (true);

create policy "Public read fact sources"
on public.fact_sources for select
to anon, authenticated
using (true);

create policy "Public read research chunks"
on public.research_chunks for select
to anon, authenticated
using (true);

-- =========================
-- SAMPLE DATA
-- =========================

-- Insert Porsche 911 Turbo S
INSERT INTO public.cars (make, model, generation, model_year, production_start_year, production_end_year, production_count, current_status, summary, caveats)
VALUES (
  'Porsche',
  '911 Turbo S',
  '992.1',
  2026,
  2024,
  null,
  5000,
  'In Production',
  'The pinnacle of the 911 Turbo lineage, featuring a 3.7L twin-turbo flat-6 producing 650 hp. The Turbo S represents the ultimate expression of the 992-generation 911.',
  '2026 model year details may vary from final production specs. Always verify with official Porsche sources.'
);

-- Insert Porsche 911 GT3 RS
INSERT INTO public.cars (make, model, generation, model_year, production_start_year, production_end_year, production_count, current_status, summary, caveats)
VALUES (
  'Porsche',
  '911 GT3 RS',
  '992.1',
  2024,
  2022,
  2024,
  3000,
  'Discontinued',
  'Track-focused naturally aspirated 911 with a 4.0L flat-6 producing 518 hp. Features extensive aerodynamic package with DRS and active suspension.',
  'GT3 RS is discontinued for 2025. No 2025 or 2026 model confirmed. The 992.1 generation has ended.'
);

-- Insert Bugatti Chiron (2024 end-of-line)
INSERT INTO public.cars (make, model, generation, model_year, production_start_year, production_end_year, production_count, current_status, summary, caveats)
VALUES (
  'Bugatti',
  'Chiron',
  'Chiron Family',
  2024,
  2016,
  2024,
  500,
  'End of Production',
  'The final year of the Bugatti Chiron family. 2024 marks the end of an era with the Chiron Super Sport 300+ and special editions. Total production capped at 500 units across all variants.',
  '2024 is the final model year for the Chiron family. Bugatti has transitioned to the new Tourbillon platform. No 2025 or 2026 Chiron models exist.'
);

-- Insert Ferrari LaFerrari
INSERT INTO public.cars (make, model, generation, model_year, production_start_year, production_end_year, production_count, current_status, summary, caveats)
VALUES (
  'Ferrari',
  'LaFerrari',
  'F150',
  2015,
  2013,
  2016,
  499,
  'Discontinued',
  'Ferrari''s first hybrid hypercar, combining a 6.3L V12 with an electric motor for 949 hp combined. The LaFerrari represents Ferrari''s Formula 1 technology in a road car.',
  'LaFerrari is no longer in production. All 499 coupes and 210 convertibles (Aperta) were sold before production ended. Values have significantly appreciated.'
);

-- Insert Lamborghini Aventador SVJ
INSERT INTO public.cars (make, model, generation, model_year, production_start_year, production_end_year, production_count, current_status, summary, caveats)
VALUES (
  'Lamborghini',
  'Aventador SVJ',
  'Aventador',
  2022,
  2018,
  2022,
  900,
  'Discontinued',
  'The most extreme Aventador variant with a 6.5L V12 producing 759 hp. SVJ stands for Super Veloce Jota, featuring ALA aerodynamic system and track-focused setup.',
  'NO 2026 AVENTADOR SVJ EXISTS. The Aventador lineup ended in 2022. Lamborghini has replaced the Aventador with the Revuelto hybrid V12. Do not confuse with future models.'
);

-- =========================
-- VARIANTS
-- =========================

-- Get car IDs (you may need to adjust these based on actual IDs)
-- For demo, we'll use placeholder UUIDs - replace with actual IDs from above inserts

-- Porsche 911 Turbo S variants
INSERT INTO public.car_variants (car_id, variant_name, body_style, drivetrain, transmission, seats, description, is_primary_variant)
VALUES (
  (SELECT id FROM public.cars WHERE make = 'Porsche' AND model = '911 Turbo S'),
  'Turbo S Coupe',
  'Coupe',
  'AWD',
  '8-Speed PDK',
  4,
  'The standard Turbo S with all-wheel drive and 650 hp.',
  true
);

INSERT INTO public.car_variants (car_id, variant_name, body_style, drivetrain, transmission, seats, description, is_primary_variant)
VALUES (
  (SELECT id FROM public.cars WHERE make = 'Porsche' AND model = '911 Turbo S'),
  'Turbo S Cabriolet',
  'Convertible',
  'AWD',
  '8-Speed PDK',
  4,
  'Convertible version of the Turbo S with same powertrain.',
  false
);

-- Porsche 911 GT3 RS variants
INSERT INTO public.car_variants (car_id, variant_name, body_style, drivetrain, transmission, seats, description, is_primary_variant)
VALUES (
  (SELECT id FROM public.cars WHERE make = 'Porsche' AND model = '911 GT3 RS'),
  'GT3 RS',
  'Coupe',
  'RWD',
  '7-Speed PDK',
  2,
  'Track-focused naturally aspirated GT3 RS with 518 hp.',
  true
);

-- Bugatti Chiron variants
INSERT INTO public.car_variants (car_id, variant_name, body_style, drivetrain, transmission, seats, description, is_primary_variant)
VALUES (
  (SELECT id FROM public.cars WHERE make = 'Bugatti' AND model = 'Chiron'),
  'Chiron Sport',
  'Coupe',
  'AWD',
  '7-Speed DSG',
  2,
  'The standard Chiron with 1,479 hp from the 8.0L quad-turbo W16.',
  true
);

INSERT INTO public.car_variants (car_id, variant_name, body_style, drivetrain, transmission, seats, description, is_primary_variant)
VALUES (
  (SELECT id FROM public.cars WHERE make = 'Bugatti' AND model = 'Chiron'),
  'Chiron Super Sport 300+',
  'Coupe',
  'AWD',
  '7-Speed DSG',
  2,
  'Top-speed focused variant that broke 300 mph barrier. 1,577 hp.',
  false
);

-- Ferrari LaFerrari variants
INSERT INTO public.car_variants (car_id, variant_name, body_style, drivetrain, transmission, seats, description, is_primary_variant)
VALUES (
  (SELECT id FROM public.cars WHERE make = 'Ferrari' AND model = 'LaFerrari'),
  'LaFerrari Coupe',
  'Coupe',
  'RWD',
  '7-Speed DCT',
  2,
  'The standard LaFerrari hybrid hypercar with 949 hp combined.',
  true
);

INSERT INTO public.car_variants (car_id, variant_name, body_style, drivetrain, transmission, seats, description, is_primary_variant)
VALUES (
  (SELECT id FROM public.cars WHERE make = 'Ferrari' AND model = 'LaFerrari'),
  'LaFerrari Aperta',
  'Convertible',
  'RWD',
  '7-Speed DCT',
  2,
  'Open-top variant of the LaFerrari with 210 units produced.',
  false
);

-- Lamborghini Aventador SVJ variants
INSERT INTO public.car_variants (car_id, variant_name, body_style, drivetrain, transmission, seats, description, is_primary_variant)
VALUES (
  (SELECT id FROM public.cars WHERE make = 'Lamborghini' AND model = 'Aventador SVJ'),
  'Aventador SVJ Coupe',
  'Coupe',
  'AWD',
  '7-Speed ISR',
  2,
  'The most extreme Aventador with 759 hp and ALA aerodynamics.',
  true
);

INSERT INTO public.car_variants (car_id, variant_name, body_style, drivetrain, transmission, seats, description, is_primary_variant)
VALUES (
  (SELECT id FROM public.cars WHERE make = 'Lamborghini' AND model = 'Aventador SVJ'),
  'Aventador SVJ Roadster',
  'Convertible',
  'AWD',
  '7-Speed ISR',
  2,
  'Open-top version of the SVJ with same 759 hp V12.',
  false
);

-- =========================
-- SPECS
-- =========================

-- Porsche 911 Turbo S specs
INSERT INTO public.car_specs (variant_id, engine, displacement_liters, aspiration, hybrid_system, horsepower_hp, horsepower_ps, torque_lb_ft, torque_nm, weight_lb, weight_kg, weight_type, length_in, width_in, height_in, wheelbase_in, tire_front, tire_rear, brake_front, brake_rear, suspension, source_confidence, notes)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Turbo S Coupe'),
  '3.7L Twin-Turbo Flat-6',
  3.7,
  'Twin-Turbo',
  'None',
  650,
  660,
  590,
  800,
  3470,
  1572,
  'Curb',
  178.0,
  72.9,
  51.1,
  100.4,
  '255/35ZR20',
  '315/30ZR21',
  '410mm Ceramic Composite',
  '410mm Ceramic Composite',
  'PASM Sport with lowered ride height',
  'high',
  'Official Porsche specifications. Weight includes fluids and 90% fuel.'
);

-- Porsche 911 GT3 RS specs
INSERT INTO public.car_specs (variant_id, engine, displacement_liters, aspiration, hybrid_system, horsepower_hp, horsepower_ps, torque_lb_ft, torque_nm, weight_lb, weight_kg, weight_type, length_in, width_in, height_in, wheelbase_in, tire_front, tire_rear, brake_front, brake_rear, suspension, source_confidence, notes)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'GT3 RS'),
  '4.0L Naturally Aspirated Flat-6',
  4.0,
  'Naturally Aspirated',
  'None',
  518,
  525,
  343,
  465,
  3170,
  1440,
  'Curb',
  180.5,
  77.5,
  49.9,
  103.0,
  '275/35ZR20',
  '335/30ZR21',
  '410mm Ceramic Composite',
  '390mm Ceramic Composite',
  'PASM Sport with adaptive dampers',
  'high',
  'Official Porsche specifications. Weissach package reduces weight by 49 lbs.'
);

-- Bugatti Chiron Sport specs
INSERT INTO public.car_specs (variant_id, engine, displacement_liters, aspiration, hybrid_system, horsepower_hp, horsepower_ps, torque_lb_ft, torque_nm, weight_lb, weight_kg, weight_type, length_in, width_in, height_in, wheelbase_in, tire_front, tire_rear, brake_front, brake_rear, suspension, source_confidence, notes)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Chiron Sport'),
  '8.0L Quad-Turbo W16',
  8.0,
  'Quad-Turbo',
  'None',
  1479,
  1500,
  1180,
  1600,
  4400,
  1995,
  'Curb',
  178.0,
  78.7,
  47.2,
  106.3,
  '285/30ZR20',
  '355/25ZR21',
  '420mm Carbon-Ceramic',
  '420mm Carbon-Ceramic',
  'Adaptive dampers with hydraulic anti-roll system',
  'high',
  'Official Bugatti specifications. 1,001 hp per liter.'
);

-- Ferrari LaFerrari specs
INSERT INTO public.car_specs (variant_id, engine, displacement_liters, aspiration, hybrid_system, horsepower_hp, horsepower_ps, torque_lb_ft, torque_nm, weight_lb, weight_kg, weight_type, length_in, width_in, height_in, wheelbase_in, tire_front, tire_rear, brake_front, brake_rear, suspension, source_confidence, notes)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'LaFerrari Coupe'),
  '6.3L V12 + Electric Motor',
  6.3,
  'Naturally Aspirated',
  'Hybrid (HY-KERS)',
  949,
  963,
  664,
  900,
  3480,
  1580,
  'Curb',
  185.0,
  77.2,
  43.9,
  104.3,
  '265/30ZR19',
  '345/30ZR20',
  '398mm Carbon-Ceramic',
  '380mm Carbon-Ceramic',
  'Pushrod suspension with adaptive dampers',
  'high',
  'Official Ferrari specifications. 789 hp from V12, 120 hp from electric motor, 40 hp from gearbox.'
);

-- Lamborghini Aventador SVJ specs
INSERT INTO public.car_specs (variant_id, engine, displacement_liters, aspiration, hybrid_system, horsepower_hp, horsepower_ps, torque_lb_ft, torque_nm, weight_lb, weight_kg, weight_type, length_in, width_in, height_in, wheelbase_in, tire_front, tire_rear, brake_front, brake_rear, suspension, source_confidence, notes)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Aventador SVJ Coupe'),
  '6.5L V12',
  6.5,
  'Naturally Aspirated',
  'None',
  759,
  770,
  531,
  720,
  3470,
  1575,
  'Curb',
  182.0,
  82.0,
  46.0,
  106.3,
  '255/30ZR20',
  '355/25ZR21',
  '400mm Carbon-Ceramic',
  '380mm Carbon-Ceramic',
  'Pushrod suspension with magnetorheological dampers',
  'high',
  'Official Lamborghini specifications. ALA (Aerodinamica Lamborghini Attiva) active aerodynamics.'
);

-- =========================
-- PERFORMANCE TESTS
-- =========================

-- Porsche 911 Turbo S performance
INSERT INTO public.performance_tests (variant_id, test_type, source_type, source_name, zero_to_60_mph_sec, zero_to_100_kmh_sec, quarter_mile_sec, quarter_mile_mph, top_speed_mph, top_speed_kmh, braking_60_0_ft, lateral_g, conditions, notes)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Turbo S Coupe'),
  'Acceleration Test',
  'official',
  'Porsche',
  2.6,
  2.7,
  10.7,
  133,
  205,
  330,
  104,
  1.05,
  'Standard conditions, stock tires',
  'Official Porsche figures. 0-60 in under 2.6 seconds with rollout.'
);

INSERT INTO public.performance_tests (variant_id, test_type, source_type, source_name, zero_to_60_mph_sec, zero_to_100_kmh_sec, quarter_mile_sec, quarter_mile_mph, top_speed_mph, top_speed_kmh, braking_60_0_ft, lateral_g, conditions, notes)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Turbo S Coupe'),
  'Acceleration Test',
  'third_party',
  'Motor Trend',
  2.3,
  2.4,
  10.5,
  133,
  205,
  330,
  102,
  1.08,
  'Standard conditions, stock tires',
  'Motor Trend test with 1-foot rollout. Slightly faster than official numbers.'
);

-- Porsche 911 GT3 RS performance
INSERT INTO public.performance_tests (variant_id, test_type, source_type, source_name, zero_to_60_mph_sec, zero_to_100_kmh_sec, quarter_mile_sec, quarter_mile_mph, top_speed_mph, top_speed_kmh, braking_60_0_ft, lateral_g, conditions, notes)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'GT3 RS'),
  'Acceleration Test',
  'official',
  'Porsche',
  3.0,
  3.1,
  11.3,
  130,
  184,
  296,
  107,
  1.10,
  'Standard conditions, stock tires',
  'Official Porsche figures. Weissach package is 0.2s faster 0-60.'
);

INSERT INTO public.performance_tests (variant_id, test_type, source_type, source_name, zero_to_60_mph_sec, zero_to_100_kmh_sec, quarter_mile_sec, quarter_mile_mph, top_speed_mph, top_speed_kmh, braking_60_0_ft, lateral_g, conditions, notes)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'GT3 RS'),
  'Nürburgring Lap',
  'third_party',
  'Porsche',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'With Weissach package, Michelin Pilot Sport Cup 2 R tires',
  '6:43.300 minutes at Nürburgring Nordschleife. Unofficial but widely accepted.'
);

-- Bugatti Chiron performance
INSERT INTO public.performance_tests (variant_id, test_type, source_type, source_name, zero_to_60_mph_sec, zero_to_100_kmh_sec, zero_to_200_kmh_sec, quarter_mile_sec, quarter_mile_mph, top_speed_mph, top_speed_kmh, braking_60_0_ft, conditions, notes)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Chiron Sport'),
  'Acceleration Test',
  'official',
  'Bugatti',
  2.4,
  2.5,
  6.1,
  9.9,
  145,
  261,
  420,
  109,
  'Standard conditions, stock tires',
  'Official Bugatti figures. Top speed electronically limited to 261 mph.'
);

-- Ferrari LaFerrari performance
INSERT INTO public.performance_tests (variant_id, test_type, source_type, source_name, zero_to_60_mph_sec, zero_to_100_kmh_sec, quarter_mile_sec, quarter_mile_mph, top_speed_mph, top_speed_kmh, braking_60_0_ft, lateral_g, conditions, notes)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'LaFerrari Coupe'),
  'Acceleration Test',
  'official',
  'Ferrari',
  2.9,
  3.0,
  10.0,
  130,
  217,
  350,
  106,
  1.15,
  'Standard conditions, stock tires',
  'Official Ferrari figures. 0-60 in under 3.0 seconds.'
);

INSERT INTO public.performance_tests (variant_id, test_type, source_type, source_name, zero_to_60_mph_sec, zero_to_100_kmh_sec, quarter_mile_sec, quarter_mile_mph, top_speed_mph, top_speed_kmh, braking_60_0_ft, lateral_g, conditions, notes)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'LaFerrari Coupe'),
  'Fiorano Circuit Lap',
  'official',
  'Ferrari',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Standard conditions',
  '1:14.500 minutes at Fiorano. Faster than Ferrari FXX-K.'
);

-- Lamborghini Aventador SVJ performance
INSERT INTO public.performance_tests (variant_id, test_type, source_type, source_name, zero_to_60_mph_sec, zero_to_100_kmh_sec, quarter_mile_sec, quarter_mile_mph, top_speed_mph, top_speed_kmh, braking_60_0_ft, lateral_g, conditions, notes)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Aventador SVJ Coupe'),
  'Acceleration Test',
  'official',
  'Lamborghini',
  2.8,
  2.9,
  9.8,
  152,
  217,
  350,
  98,
  1.10,
  'Standard conditions, stock tires',
  'Official Lamborghini figures. 0-100 km/h in 2.8 seconds.'
);

INSERT INTO public.performance_tests (variant_id, test_type, source_type, source_name, zero_to_60_mph_sec, zero_to_100_kmh_sec, quarter_mile_sec, quarter_mile_mph, top_speed_mph, top_speed_kmh, braking_60_0_ft, lateral_g, conditions, notes)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Aventador SVJ Coupe'),
  'Nürburgring Lap',
  'official',
  'Lamborghini',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Pirelli P Zero Corsa tires',
  '6:44.970 minutes at Nürburgring Nordschleife. Fastest production SUV at time of record.'
);

-- =========================
-- TRACK RECORDS
-- =========================

-- Porsche 911 GT3 RS track records
INSERT INTO public.track_records (variant_id, track_name, lap_time, lap_time_seconds, driver, tire, package_or_options, record_type, notes)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'GT3 RS'),
  'Nürburgring Nordschleife',
  '6:43.300',
  403.3,
  'Lars Kern',
  'Michelin Pilot Sport Cup 2 R',
  'Weissach Package',
  'official',
  'Unofficial but widely accepted. Porsche test driver Lars Kern.'
);

-- Lamborghini Aventador SVJ track records
INSERT INTO public.track_records (variant_id, track_name, lap_time, lap_time_seconds, driver, tire, package_or_options, record_type, notes)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Aventador SVJ Coupe'),
  'Nürburgring Nordschleife',
  '6:44.970',
  404.97,
  'Marco Mapelli',
  'Pirelli P Zero Corsa',
  'Standard',
  'official',
  'Official Lamborghini record. Driver Marco Mapelli.'
);

-- =========================
-- PRICING
-- =========================

-- Porsche 911 Turbo S pricing
INSERT INTO public.pricing_market (variant_id, price_type, amount, currency, market_region, date_observed, context, source_name, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Turbo S Coupe'),
  'launch_msrp',
  230400,
  'USD',
  'USA',
  '2024-01-01',
  'Base price before options',
  'Porsche USA',
  'high'
);

-- Porsche 911 GT3 RS pricing
INSERT INTO public.pricing_market (variant_id, price_type, amount, currency, market_region, date_observed, context, source_name, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'GT3 RS'),
  'launch_msrp',
  223800,
  'USD',
  'USA',
  '2022-01-01',
  'Base price before options',
  'Porsche USA',
  'high'
);

-- Bugatti Chiron Sport pricing
INSERT INTO public.pricing_market (variant_id, price_type, amount, currency, market_region, date_observed, context, source_name, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Chiron Sport'),
  'launch_msrp',
  3200000,
  'USD',
  'Europe',
  '2016-01-01',
  'Base price at launch',
  'Bugatti',
  'high'
);

-- Ferrari LaFerrari pricing
INSERT INTO public.pricing_market (variant_id, price_type, amount, currency, market_region, date_observed, context, source_name, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'LaFerrari Coupe'),
  'launch_msrp',
  1400000,
  'USD',
  'Europe',
  '2013-01-01',
  'Base price at launch (invitation only)',
  'Ferrari',
  'high'
);

INSERT INTO public.pricing_market (variant_id, price_type, amount, currency, market_region, date_observed, context, source_name, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'LaFerrari Coupe'),
  'market_estimate',
  3500000,
  'USD',
  'USA',
  '2024-01-01',
  'Current market value estimate for well-maintained example',
  'RM Sotheby''s',
  'medium'
);

-- Lamborghini Aventador SVJ pricing
INSERT INTO public.pricing_market (variant_id, price_type, amount, currency, market_region, date_observed, context, source_name, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Aventador SVJ Coupe'),
  'launch_msrp',
  517770,
  'USD',
  'USA',
  '2018-01-01',
  'Base price at launch',
  'Lamborghini USA',
  'high'
);

-- =========================
-- OWNERSHIP / SAFETY
-- =========================

-- Porsche 911 Turbo S ownership
INSERT INTO public.ownership_safety (variant_id, category, title, details, rating_value, rating_source, is_public_rating_available, severity, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Turbo S Coupe'),
  'warranty',
  'New Car Warranty',
  '4 years / 50,000 miles bumper-to-bumper. Optional extended warranty available.',
  null,
  null,
  null,
  null,
  'high'
);

INSERT INTO public.ownership_safety (variant_id, category, title, details, rating_value, rating_source, is_public_rating_available, severity, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Turbo S Coupe'),
  'safety',
  'Crash Test Rating',
  'No public crash-test rating found. Exotic cars are not typically tested by NHTSA or IIHS.',
  null,
  null,
  false,
  null,
  'high'
);

-- Porsche 911 GT3 RS ownership
INSERT INTO public.ownership_safety (variant_id, category, title, details, rating_value, rating_source, is_public_rating_available, severity, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'GT3 RS'),
  'warranty',
  'New Car Warranty',
  '4 years / 50,000 miles bumper-to-bumper.',
  null,
  null,
  null,
  null,
  'high'
);

INSERT INTO public.ownership_safety (variant_id, category, title, details, rating_value, rating_source, is_public_rating_available, severity, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'GT3 RS'),
  'practicality',
  'Daily Drivability',
  'Not recommended for daily driving. Stiff suspension, limited cargo space, and high operating costs.',
  null,
  null,
  null,
  null,
  'medium'
);

-- Bugatti Chiron ownership
INSERT INTO public.ownership_safety (variant_id, category, title, details, rating_value, rating_source, is_public_rating_available, severity, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Chiron Sport'),
  'maintenance',
  'Maintenance Costs',
  'Extremely high. Annual maintenance recommended. Tire set replacement costs $30,000+. Major service every 2 years.',
  null,
  null,
  null,
  null,
  'high'
);

INSERT INTO public.ownership_safety (variant_id, category, title, details, rating_value, rating_source, is_public_rating_available, severity, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Chiron Sport'),
  'safety',
  'Crash Test Rating',
  'No public crash-test rating found. Bugatti does not participate in standard crash testing.',
  null,
  null,
  false,
  null,
  'high'
);

-- Ferrari LaFerrari ownership
INSERT INTO public.ownership_safety (variant_id, category, title, details, rating_value, rating_source, is_public_rating_available, severity, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'LaFerrari Coupe'),
  'warranty',
  'Ferrari Warranty',
  '6 years / unlimited miles from original purchase date. Extended warranty available.',
  null,
  null,
  null,
  null,
  'high'
);

INSERT INTO public.ownership_safety (variant_id, category, title, details, rating_value, rating_source, is_public_rating_available, severity, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'LaFerrari Coupe'),
  'reliability',
  'Reliability Notes',
  'Generally reliable for a hypercar. Hybrid system has proven durable. Regular use recommended to prevent battery issues.',
  null,
  null,
  null,
  null,
  'medium'
);

-- Lamborghini Aventador SVJ ownership
INSERT INTO public.ownership_safety (variant_id, category, title, details, rating_value, rating_source, is_public_rating_available, severity, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Aventador SVJ Coupe'),
  'warranty',
  'New Car Warranty',
  '3 years / unlimited miles. Extended warranty available.',
  null,
  null,
  null,
  null,
  'high'
);

INSERT INTO public.ownership_safety (variant_id, category, title, details, rating_value, rating_source, is_public_rating_available, severity, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Aventador SVJ Coupe'),
  'recall',
  'Known Recalls',
  'Check with Lamborghini dealer for any open recalls. Some early Aventador models had fuel system recalls.',
  null,
  null,
  null,
  'medium',
  'high'
);

INSERT INTO public.ownership_safety (variant_id, category, title, details, rating_value, rating_source, is_public_rating_available, severity, confidence)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'Aventador SVJ Coupe'),
  'safety',
  'Crash Test Rating',
  'No public crash-test rating found. Exotic supercars are not typically crash tested.',
  null,
  null,
  false,
  null,
  'high'
);

-- =========================
-- RESEARCH CHUNKS (for AI)
-- =========================

INSERT INTO public.research_chunks (car_id, chunk_title, chunk_text, chunk_type, metadata)
VALUES (
  (SELECT id FROM public.cars WHERE make = 'Porsche' AND model = '911 Turbo S'),
  'Turbo S Overview',
  'The 2026 Porsche 911 Turbo S (992.1 generation) is the flagship turbocharged model in the 911 lineup. It features a 3.7-liter twin-turbocharged flat-6 engine producing 650 hp and 590 lb-ft of torque. The Turbo S comes standard with all-wheel drive and an 8-speed PDK transmission. It can accelerate from 0-60 mph in approximately 2.6 seconds and has a top speed of 205 mph.',
  'specs',
  '{"source": "official", "confidence": "high"}'
);

INSERT INTO public.research_chunks (car_id, chunk_title, chunk_text, chunk_type, metadata)
VALUES (
  (SELECT id FROM public.cars WHERE make = 'Porsche' AND model = '911 GT3 RS'),
  'GT3 RS Discontinuation',
  'The Porsche 911 GT3 RS (992.1) was discontinued in 2024. Production ran from 2022 to 2024 with approximately 3,000 units produced. There is NO 2025 or 2026 GT3 RS. Porsche has not announced a next-generation GT3 RS, though a 992.2 GT3 is expected. Do not confuse with the standard GT3 or GT3 Touring.',
  'caveat',
  '{"source": "official", "confidence": "high"}'
);

INSERT INTO public.research_chunks (car_id, chunk_title, chunk_text, chunk_type, metadata)
VALUES (
  (SELECT id FROM public.cars WHERE make = 'Bugatti' AND model = 'Chiron'),
  'Chiron End of Production',
  'The 2024 Bugatti Chiron marks the END OF PRODUCTION for the entire Chiron family. Bugatti produced exactly 500 Chiron variants from 2016 to 2024. The final models were the Chiron Super Sport 300+ and special editions. Bugatti has transitioned to the new Tourbillon platform with a V16 hybrid powertrain. There is NO 2025 or 2026 Bugatti Chiron.',
  'caveat',
  '{"source": "official", "confidence": "high"}'
);

INSERT INTO public.research_chunks (car_id, chunk_title, chunk_text, chunk_type, metadata)
VALUES (
  (SELECT id FROM public.cars WHERE make = 'Ferrari' AND model = 'LaFerrari'),
  'LaFerrari Hybrid System',
  'The Ferrari LaFerrari (F150) is a hybrid hypercar combining a 6.3-liter V12 engine with an electric motor (HY-KERS system). Total combined output is 949 hp (789 hp from V12, 120 hp from electric motor, 40 hp from gearbox). The LaFerrari was produced from 2013 to 2016 with 499 coupes and 210 Aperta convertibles. It is no longer in production.',
  'specs',
  '{"source": "official", "confidence": "high"}'
);

INSERT INTO public.research_chunks (car_id, chunk_title, chunk_text, chunk_type, metadata)
VALUES (
  (SELECT id FROM public.cars WHERE make = 'Lamborghini' AND model = 'Aventador SVJ'),
  'NO 2026 Aventador SVJ',
  'CRITICAL: There is NO 2026 Lamborghini Aventador SVJ. The Aventador lineup ended in 2022 after production of 900 SVJ units (700 coupes, 300 Roadsters). Lamborghini has replaced the Aventador with the Revuelto, a new V12 hybrid. Any mention of a 2026 Aventador SVJ is incorrect. The Aventador SVJ was the most extreme version of the Aventador with 759 hp and active aerodynamics (ALA).',
  'caveat',
  '{"source": "official", "confidence": "high"}'
);

INSERT INTO public.research_chunks (car_id, chunk_title, chunk_text, chunk_type, metadata)
VALUES (
  (SELECT id FROM public.cars WHERE make = 'Lamborghini' AND model = 'Aventador SVJ'),
  'Aventador SVJ Nürburgring Record',
  'The Lamborghini Aventador SVJ set a production car lap record at the Nürburgring Nordschleife with a time of 6:44.970 minutes in 2018. Driver Marco Mapelli achieved this time on Pirelli P Zero Corsa tires. This made it the fastest production car at the time, though later surpassed by the Mercedes-AMG GT Black Series.',
  'track',
  '{"source": "official", "confidence": "high"}'
);

-- =========================
-- END OF SCHEMA
-- =========================