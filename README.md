# Exotic Car Assistant - Flutter + Supabase

AI-powered exotic car knowledge assistant with verified Supabase backend. Built for Flutter hackathon.

## Features

- **Verified Car Data**: All information comes from a trusted Supabase database, not hallucinated AI
- **Premium UI**: Modern, clean Flutter mobile interface
- **AI Chat**: Ask natural questions about exotic cars
- **Car Profiles**: Detailed specs, performance, track records, pricing, and ownership data
- **Compare Tool**: Compare two cars side-by-side
- **Search**: Quick search across all cars in database

## Tech Stack

- **Frontend**: Flutter (Dart)
- **Backend**: Supabase
- **Database**: PostgreSQL with pgvector for AI search
- **Libraries**: supabase_flutter, flutter_dotenv

## Project Structure

```
lib/
├── main.dart                          # App entry point with navigation
├── core/
│   └── supabase_config.dart           # Supabase connection setup
├── models/
│   ├── car.dart                       # Car model
│   ├── car_variant.dart               # Car variant model
│   ├── car_spec.dart                  # Specifications model
│   ├── performance_test.dart          # Performance test data
│   ├── track_record.dart              # Track lap times
│   ├── pricing_market.dart            # Pricing and market data
│   ├── ownership_safety.dart          # Ownership, safety, recalls
│   └── research_chunk.dart            # AI research chunks
├── repositories/
│   └── car_repository.dart            # Data access layer
├── services/
│   └── ai_context_builder.dart        # AI context builder
└── screens/
    ├── cars_screen.dart               # Home screen with car list
    ├── car_detail_screen.dart         # Car profile page
    ├── ai_chat_screen.dart            # AI chat interface
    └── compare_screen.dart            # Car comparison tool
```

## Setup Instructions

### 1. Prerequisites

- Flutter SDK (>=3.0.0 <4.0.0)
- Supabase account
- Code editor (VS Code recommended)

### 2. Clone and Install

```bash
# Navigate to project directory
cd exotic_car_assistant

# Install Flutter dependencies
flutter pub get
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Go to Project Settings > API to get your credentials:
   - Project URL
   - anon/public key (NEVER use service_role key in Flutter!)

3. Enable required extensions in Supabase SQL Editor:
   ```sql
   create extension if not exists "uuid-ossp";
   create extension if not exists vector;
   ```

4. Run the SQL migration (provided in `supabase_schema.sql` or below) to create all tables

5. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

6. Update `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Add Sample Data

Insert sample exotic car data into your Supabase database. Here's an example:

```sql
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
  'The pinnacle of the 911 Turbo lineage, featuring a 3.7L twin-turbo flat-6 producing 650 hp.',
  '2026 model year details may vary from final production specs.'
);

-- Get the car ID for variants
-- (Replace 'car-uuid-here' with actual ID from previous insert)

INSERT INTO public.car_variants (car_id, variant_name, body_style, drivetrain, transmission, seats, description, is_primary_variant)
VALUES (
  'car-uuid-here',
  'Turbo S Coupe',
  'Coupe',
  'AWD',
  '8-Speed PDK',
  4,
  'The standard Turbo S variant with all-wheel drive.',
  true
);

-- Add specs, performance, pricing, etc. following the schema
```

See the Supabase schema below for all table structures.

### 5. Run the App

```bash
# Run on connected device/emulator
flutter run

# Or build for release
flutter build apk --release
```

## Supabase Schema

The complete SQL migration is provided in the task description. Key tables:

- `cars` - Car identity and overview
- `car_variants` - Different versions of each car
- `car_specs` - Technical specifications
- `performance_tests` - Acceleration, braking, top speed data
- `track_records` - Lap times at various circuits
- `pricing_market` - MSRP, auction prices, market values
- `colors_options` - Available colors and packages
- `ownership_safety` - Warranty, maintenance, recalls, safety ratings
- `research_chunks` - AI-searchable research text with embeddings

## AI Integration

The app includes an AI context builder that:

1. Retrieves structured car data from Supabase
2. Searches research chunks for relevant information
3. Builds a context block for the AI model
4. Ensures the AI only answers from verified data

**To connect a real AI API** (OpenAI, Claude, etc.):

Edit `lib/screens/ai_chat_screen.dart` and replace the `_generateDemoResponse` method with an actual API call:

```dart
Future<String> callAI(String context, String question) async {
  final response = await http.post(
    Uri.parse('https://api.openai.com/v1/chat/completions'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_OPENAI_API_KEY',
    },
    body: jsonEncode({
      'model': 'gpt-4',
      'messages': [
        {'role': 'system', 'content': context},
        {'role': 'user', 'content': question},
      ],
    }),
  );
  // Parse and return response
}
```

## Important Notes

### Data Accuracy
- **Never hallucinate**: The AI only answers from Supabase data
- **Missing data**: Shows "Not confirmed in database" for unknown values
- **Source separation**: Official vs third-party test data is clearly labeled
- **Safety ratings**: Missing ratings show "No public crash-test rating found" (not bad)

### Special Cases
- **Aventador SVJ**: No 2026 model exists - clearly stored in database
- **Bugatti Chiron**: 2024 treated as end-of-line context, not normal model year
- **Null values**: Always show "Not confirmed in database."

### Security
- ✅ Use only anon/publishable key in Flutter
- ❌ NEVER use service_role key in frontend
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Public read access, private write access

## Demo Flow

1. Open app → See car list with search
2. Tap a car → View detailed specs, performance, pricing
3. Tap "Ask AI" → Chat with AI about cars
4. Use Compare tab → Select two cars to compare

## Supported Cars (Add Your Own)

The schema supports any exotic/hypercar. Add data for:
- Porsche 911 Turbo S
- Porsche 911 GT3 RS
- Bugatti Chiron (2024 end-of-line)
- Ferrari LaFerrari
- Lamborghini Aventador SVJ
- And many more!

## Hackathon Tips

1. **Pre-populate database** with 5-10 cars for demo
2. **Add images** (car photos) to make UI pop
3. **Show AI context** in chat to demonstrate data sourcing
4. **Highlight accuracy** - show how app avoids hallucinations
5. **Demo the compare feature** for engagement

## Troubleshooting

**"Supabase not initialized" error:**
- Check `.env` file exists and has correct credentials
- Verify Supabase URL and anon key are correct

**"Failed to load cars" error:**
- Check internet connection
- Verify Supabase project is active
- Check RLS policies allow public read access

**App crashes on startup:**
- Run `flutter clean && flutter pub get`
- Ensure Flutter SDK version is compatible

## License

MIT License - Built for Flutter hackathon

## Credits

Built with Flutter + Supabase + pgvector