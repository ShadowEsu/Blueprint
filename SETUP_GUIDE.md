# 🚀 Exotic Car Assistant - Complete Setup Guide

This guide will walk you through connecting your Flutter app to Supabase step-by-step.

## 📋 Prerequisites

Before you begin, make sure you have:
- [ ] Flutter SDK 3.0+ installed (`flutter --version`)
- [ ] A code editor (VS Code recommended)
- [ ] A Supabase account (free at [supabase.com](https://supabase.com))
- [ ] An emulator/simulator running OR a physical device connected

---

## 🔧 Step 1: Install Flutter Dependencies

Open your terminal in the project folder and run:

```bash
flutter pub get
```

This installs all required packages:
- `supabase_flutter` - Supabase client for Flutter
- `flutter_dotenv` - Environment variable management
- `cupertino_icons` - iOS-style icons

**Expected output:**
```
Resolving dependencies...
Got socket error trying to find package...
+ flutter_dotenv 5.1.0
+ supabase_flutter 2.3.4
...
```

---

## 🗄️ Step 2: Set Up Supabase Database

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `exotic-car-assistant` (or any name)
   - **Database Password**: Save this! You'll need it for SQL Editor
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

### 2.2 Get Your API Credentials

1. In your Supabase project, go to **Settings** (gear icon in left sidebar)
2. Click **"API"** in the settings menu
3. You'll see two important values:

   **Project URL:**
   ```
   https://your-project-id.supabase.co
   ```

   **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   ⚠️ **IMPORTANT**: 
   - ✅ Use the **anon/public** key in Flutter
   - ❌ NEVER use the **service_role** key in frontend code!

4. Copy both values - you'll need them in the next step

### 2.3 Enable Required Extensions

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Paste this and click **"Run"**:

```sql
-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists vector;
```

**Expected output:**
```
Success. No rows returned
```

### 2.4 Run the Database Schema

1. In SQL Editor, click **"New query"**
2. Open the file `supabase_schema.sql` from this project
3. Copy ALL the SQL code from that file
4. Paste it into the Supabase SQL Editor
5. Click **"Run"**

**This will create:**
- 11 database tables (cars, variants, specs, performance, etc.)
- Indexes for fast queries
- Vector search function for AI
- Row Level Security policies
- Sample data for 5 exotic cars

**Expected output:**
```
Success. No rows returned
```

### 2.5 Verify Data Was Inserted

Run this query to check if sample data was inserted:

```sql
SELECT make, model, model_year, current_status 
FROM public.cars 
ORDER BY make, model;
```

**Expected output:**
```
  make    |     model     | model_year | current_status
----------|---------------|------------|----------------
 Bugatti  | Chiron        |       2024 | End of Production
 Ferrari  | LaFerrari     |       2015 | Discontinued
 Lamborghini | Aventador SVJ |     2022 | Discontinued
 Porsche  | 911 GT3 RS    |       2024 | Discontinued
 Porsche  | 911 Turbo S   |       2026 | In Production
```

---

## 🔐 Step 3: Configure Flutter Environment Variables

### 3.1 Create .env File

1. In your project root, create a new file named `.env`
2. Copy the contents from `.env.example`
3. Replace with your actual Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-actual-project-id.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key-here
```

**Example:**
```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJpYXQiOjE3MTY1MjAwMDAsImV4cCI6MjAzMjA5NjAwMH0.example
```

⚠️ **SECURITY NOTE**: The `.env` file is in `.gitignore` and will NOT be committed to git. Never share your service_role key!

### 3.2 Verify .env is Loaded

The app will automatically load `.env` on startup via `SupabaseConfig.initialize()` in `main.dart`.

---

## 📱 Step 4: Run the Flutter App

### 4.1 Check Flutter Setup

Run these commands to verify everything is ready:

```bash
# Check Flutter installation
flutter doctor

# Check connected devices
flutter devices
```

**Expected output for devices:**
```
2 connected devices:

iPhone 15 Pro Max (mobile) • 12345678-90AB-CDEF-1234-567890ABCDEF • ios
Chrome (web)               • chrome                               • web
```

### 4.2 Run the App

```bash
# Run on connected device/emulator
flutter run
```

Or for a specific device:
```bash
flutter run -d iPhone
flutter run -d chrome
```

### 4.3 Hot Reload (Development)

While the app is running:
- Press `r` in terminal for hot reload
- Press `R` for hot restart
- Press `q` to quit

---

## ✅ Step 5: Verify Connection

### 5.1 Check App Launch

When the app opens, you should see:
- ✅ **"Exotic Car Assistant"** title in app bar
- ✅ **Search bar** at the top
- ✅ **List of 5 cars** (Porsche 911 Turbo S, GT3 RS, Bugatti Chiron, Ferrari LaFerrari, Lamborghini Aventador SVJ)
- ✅ **Bottom navigation** with Cars, Compare, AI Chat tabs

### 5.2 Test Car List

1. You should see all 5 cars listed
2. Try searching for "Porsche" - should show 2 results
3. Try searching for "Lamborghini" - should show 1 result

### 5.3 Test Car Details

1. Tap on **"2026 Porsche 911 Turbo S"**
2. You should see:
   - ✅ Hero section with car name and summary
   - ✅ **Key Specifications** section (engine, horsepower, weight, etc.)
   - ✅ **Performance** section (0-60, top speed, braking)
   - ✅ **Track Records** section
   - ✅ **Pricing & Market Value** section
   - ✅ **Ownership, Safety & Caveats** section

### 5.4 Test AI Chat

1. Tap the **chat icon** in app bar OR bottom **"AI Chat"** tab
2. Type: `"What is the horsepower of the Porsche 911 Turbo S?"`
3. Tap send
4. You should see:
   - ✅ Your question in blue bubble
   - ✅ AI response showing context from database
   - ✅ "Searching database..." loading indicator

### 5.5 Test Compare Feature

1. Tap **"Compare"** tab in bottom navigation
2. Select **Car 1**: Porsche 911 Turbo S
3. Select **Car 2**: Ferrari LaFerrari
4. You should see a comparison table

---

## 🐛 Troubleshooting

### Problem: "Supabase not initialized"

**Solution:**
1. Check that `.env` file exists in project root
2. Verify `.env` has correct SUPABASE_URL and SUPABASE_ANON_KEY
3. Make sure there are no typos in the keys
4. Run `flutter clean && flutter pub get`

### Problem: "Failed to load cars"

**Solution:**
1. Check internet connection
2. Verify Supabase project is active (not paused)
3. Go to Supabase Dashboard → Table Editor → Check if `cars` table exists
4. Verify RLS policies are set (should allow public read)
5. Check Supabase logs for errors

### Problem: App shows "No cars in database"

**Solution:**
1. Go to Supabase → SQL Editor
2. Run the sample data insert queries from `supabase_schema.sql`
3. Or manually insert data via Table Editor

### Problem: "No connected devices"

**Solution:**
```bash
# For iOS simulator
open -a Simulator

# For Android emulator
flutter emulators --launch <emulator-id>

# Or connect physical device with USB debugging enabled
```

### Problem: Build errors

**Solution:**
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter run
```

---

## 🎯 Quick Test Commands

Run these to verify everything works:

```bash
# 1. Check Flutter installation
flutter doctor

# 2. Install dependencies
flutter pub get

# 3. Run the app
flutter run

# 4. In another terminal, check Supabase connection
# (Add this to a test screen or use Supabase client directly)
```

---

## 📊 Supabase Dashboard Tips

### View Your Data
1. Go to Supabase Dashboard
2. Click **"Table Editor"** in left sidebar
3. Select any table (e.g., `cars`) to view data

### Monitor API Calls
1. Go to **"API"** → **"Logs"**
2. See all requests from your Flutter app
3. Useful for debugging

### Check RLS Policies
1. Go to **"Authentication"** → **"Policies"**
2. Verify all tables have "Public read" policies

### View Vector Search
1. Go to **"SQL Editor"**
2. Run this to test vector search:
```sql
SELECT * FROM public.match_car_research_chunks(
  (SELECT embedding FROM public.research_chunks LIMIT 1),
  5,
  NULL,
  NULL
);
```

---

## 🔗 Connection Flow

Here's how the connection works:

```
Flutter App
    ↓
SupabaseConfig.initialize() [main.dart]
    ↓
Loads .env file
    ↓
Creates SupabaseClient with URL + anon key
    ↓
CarRepository uses client to query tables
    ↓
Data flows back to Flutter UI
```

---

## 📝 Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | Public API key for client-side | `eyJhbGc...` |
| `OPENAI_API_KEY` | (Optional) For AI chat integration | `sk-...` |

---

## 🎨 Customization Tips

### Change App Colors
Edit `lib/main.dart`:
```dart
theme: ThemeData(
  primarySwatch: Colors.red, // Change from blue to red
  // ...
)
```

### Add More Cars
1. Go to Supabase → Table Editor → `cars`
2. Click **"Insert new row"**
3. Fill in car details
4. Add variants, specs, performance data

### Connect Real AI API
Edit `lib/screens/ai_chat_screen.dart`:
```dart
Future<String> _generateDemoResponse(String context, String question) async {
  // Replace with actual API call to OpenAI/Claude
  final response = await http.post(
    Uri.parse('https://api.openai.com/v1/chat/completions'),
    headers: {
      'Authorization': 'Bearer YOUR_OPENAI_API_KEY',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'model': 'gpt-4',
      'messages': [
        {'role': 'system', 'content': context},
        {'role': 'user', 'content': question},
      ],
    }),
  );
  return jsonDecode(response.body)['choices'][0]['message']['content'];
}
```

---

## 🚀 Deployment (Optional)

### Build for Release

```bash
# Android APK
flutter build apk --release

# Android App Bundle (for Google Play)
flutter build appbundle --release

# iOS (requires Mac)
flutter build ios --release
```

### Deploy to App Stores
- **Android**: Upload APK/AAB to Google Play Console
- **iOS**: Upload to App Store Connect via Xcode

---

## 📚 Additional Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [supabase_flutter Package](https://pub.dev/packages/supabase_flutter)
- [pgvector Documentation](https://github.com/pgvector/pgvector)

---

## ✨ You're Ready!

Your Flutter app is now connected to Supabase and ready to:
- ✅ Display exotic car data
- ✅ Search and filter cars
- ✅ Show detailed specs and performance
- ✅ Chat with AI about cars
- ✅ Compare different models

**Next**: Add more cars, integrate a real AI API, and prepare for your hackathon demo! 🏆