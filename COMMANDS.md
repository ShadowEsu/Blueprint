# 📋 Exotic Car Assistant - Essential Commands

Quick reference for all the commands you'll need during development.

---

## 🚀 Getting Started

### First Time Setup
```bash
# 1. Make the quickstart script executable (Mac/Linux)
chmod +x quickstart.sh

# 2. Run the quickstart script
./quickstart.sh

# OR do it manually:
flutter pub get
cp .env.example .env
# Edit .env with your Supabase credentials
```

---

## 📱 Flutter Commands

### Development
```bash
# Run the app on connected device/emulator
flutter run

# Run on specific device
flutter run -d iPhone
flutter run -d chrome
flutter run -d emulator-5554

# Hot reload (while app is running)
r

# Hot restart (while app is running)
R

# Quit (while app is running)
q
```

### Building
```bash
# Clean build artifacts
flutter clean

# Get dependencies
flutter pub get

# Build Android APK (debug)
flutter build apk --debug

# Build Android APK (release)
flutter build apk --release

# Build Android App Bundle (for Google Play)
flutter build appbundle --release

# Build iOS (requires Mac)
flutter build ios --release

# Build for web
flutter build web
```

### Debugging
```bash
# Check Flutter installation
flutter doctor

# Check connected devices
flutter devices

# Check Flutter version
flutter --version

# View logs
flutter logs

# Run tests
flutter test

# Analyze code
flutter analyze
```

---

## 🗄️ Supabase Commands

### SQL Editor (in Supabase Dashboard)
```sql
-- View all cars
SELECT * FROM public.cars;

-- Count cars
SELECT COUNT(*) FROM public.cars;

-- View car variants
SELECT * FROM public.car_variants;

-- View performance data
SELECT * FROM public.performance_tests;

-- Test vector search
SELECT * FROM public.match_car_research_chunks(
  (SELECT embedding FROM public.research_chunks LIMIT 1),
  5,
  NULL,
  NULL
);
```

### Supabase CLI (Optional)
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Link to project
supabase link --project-id your-project-id

# Pull schema
supabase db pull

# Push schema
supabase db push

# Start local Supabase
supabase start

# Stop local Supabase
supabase stop
```

---

## 🔧 Git Commands

### Initial Setup
```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Flutter + Supabase car app"

# Add remote
git remote add origin https://github.com/yourusername/exotic-car-assistant.git

# Push
git push -u origin main
```

### Daily Development
```bash
# Check status
git status

# Stage changes
git add lib/
git add pubspec.yaml

# Commit
git commit -m "Add new feature"

# Push
git push

# Pull latest
git pull

# View history
git log --oneline
```

---

## 🐛 Troubleshooting Commands

### Fix Common Issues
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter run

# Clear Flutter cache
flutter pub cache repair

# Update Flutter
flutter upgrade

# Fix iOS build (Mac only)
cd ios
pod install
cd ..

# Fix Android build
cd android
./gradlew clean
cd ..
```

### Check Dependencies
```bash
# List all packages
flutter pub deps

# Check for outdated packages
flutter pub outdated

# Update packages
flutter pub upgrade
```

---

## 📊 Database Commands

### Insert Sample Data
```sql
-- Insert a new car
INSERT INTO public.cars (make, model, generation, model_year, current_status, summary)
VALUES ('McLaren', 'P1', 'MSO', 2015, 'Discontinued', 'Hybrid hypercar with 903 hp');

-- Insert variant
INSERT INTO public.car_variants (car_id, variant_name, body_style, drivetrain, is_primary_variant)
VALUES (
  (SELECT id FROM public.cars WHERE make = 'McLaren' AND model = 'P1'),
  'P1 Coupe',
  'Coupe',
  'RWD',
  true
);

-- Insert specs
INSERT INTO public.car_specs (variant_id, engine, displacement_liters, horsepower_hp, torque_lb_ft)
VALUES (
  (SELECT id FROM public.car_variants WHERE variant_name = 'P1 Coupe'),
  '3.8L Twin-Turbo V8 + Electric Motor',
  3.8,
  903,
  664
);
```

### Query Examples
```sql
-- Get all cars with their primary variant
SELECT 
  c.make, 
  c.model, 
  c.model_year,
  v.variant_name,
  s.horsepower_hp
FROM public.cars c
JOIN public.car_variants v ON c.id = v.car_id AND v.is_primary_variant = true
JOIN public.car_specs s ON v.id = s.variant_id
ORDER BY c.make, c.model;

-- Get performance data for a specific car
SELECT 
  c.make,
  c.model,
  p.test_type,
  p.zero_to_60_mph_sec,
  p.top_speed_mph,
  p.source_type
FROM public.performance_tests p
JOIN public.car_variants v ON p.variant_id = v.id
JOIN public.cars c ON v.car_id = c.id
WHERE c.make = 'Porsche' AND c.model = '911 Turbo S';

-- Get pricing data
SELECT 
  c.make,
  c.model,
  pr.price_type,
  pr.amount,
  pr.date_observed
FROM public.pricing_market pr
JOIN public.car_variants v ON pr.variant_id = v.id
JOIN public.cars c ON v.car_id = c.id
ORDER BY pr.date_observed DESC;
```

---

## 🎨 VS Code Commands

### Useful Shortcuts
```
Cmd/Ctrl + P          # Quick open file
Cmd/Ctrl + Shift + P  # Command palette
Cmd/Ctrl + `          # Toggle terminal
Cmd/Ctrl + B          # Toggle sidebar
Cmd/Ctrl + \          # Split editor
Cmd/Ctrl + W          # Close file
Cmd/Ctrl + S          # Save file
Cmd/Ctrl + Shift + F  # Search in files
Cmd/Ctrl + G          # Go to line
```

### VS Code Tasks
Press `Cmd/Ctrl + Shift + B` to run build tasks.

---

## 🧪 Testing Commands

### Flutter Tests
```bash
# Run all tests
flutter test

# Run specific test file
flutter test test/car_repository_test.dart

# Run with coverage
flutter test --coverage

# View coverage report
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

### Manual Testing Checklist
```bash
# 1. Test connection
flutter run → Navigate to cars list → Verify cars load

# 2. Test search
Search for "Porsche" → Should show 2 results

# 3. Test car details
Tap on any car → Verify all sections load

# 4. Test AI chat
Tap AI Chat → Send message → Verify context loads

# 5. Test compare
Go to Compare tab → Select 2 cars → Verify comparison
```

---

## 📦 Package Management

### Add New Package
```bash
# Add package
flutter pub add package_name

# Add dev dependency
flutter pub add --dev package_name

# Example: Add HTTP package for AI API
flutter pub add http
```

### Update Packages
```bash
# Check outdated
flutter pub outdated

# Upgrade all
flutter pub upgrade

# Upgrade specific
flutter pub upgrade package_name
```

---

## 🔍 Debug Commands

### Flutter Debug
```bash
# Run with debug mode
flutter run --debug

# Run with profile mode
flutter run --profile

# Attach debugger to running app
flutter attach

# View widget tree
# Press 'w' in debug mode
```

### Supabase Debug
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'cars';

-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cars';

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'research_chunks';
```

---

## 🚀 Deployment Commands

### Android
```bash
# Build APK
flutter build apk --release

# Build App Bundle
flutter build appbundle --release

# Install on connected device
flutter install
```

### iOS (Mac only)
```bash
# Build iOS
flutter build ios --release

# Archive for App Store
flutter build ipa --export-options-plist=ExportOptions.plist
```

### Web
```bash
# Build web
flutter build web

# Serve locally
cd build/web
python3 -m http.server 8080
# Open http://localhost:8080
```

---

## 📝 Useful One-Liners

```bash
# Quick setup
flutter pub get && echo "✅ Ready!"

# Clean and restart
flutter clean && flutter pub get && flutter run

# Check all devices
flutter devices | grep -E "(iPhone|Android|Chrome)"

# Count lines of code
find lib -name "*.dart" | xargs wc -l

# Find all TODOs
grep -r "TODO" lib/

# Format all Dart files
dart format lib/

# Analyze code
flutter analyze lib/
```

---

## 🆘 Emergency Commands

### If Nothing Works
```bash
# Nuclear option: Clean everything
flutter clean
rm -rf build/
rm -rf .dart_tool/
rm pubspec.lock
flutter pub get
flutter run

# Reset Git
git reset --hard HEAD
git clean -fd

# Reinstall Flutter (if needed)
# Download from https://flutter.dev
```

---

## 📚 Quick Reference

| Task | Command |
|------|---------|
| Run app | `flutter run` |
| Build APK | `flutter build apk --release` |
| Install deps | `flutter pub get` |
| Clean build | `flutter clean` |
| Check devices | `flutter devices` |
| Run tests | `flutter test` |
| Format code | `dart format lib/` |
| Analyze | `flutter analyze` |

---

## 🎯 Most Common Workflow

```bash
# 1. Start development
flutter pub get
flutter run

# 2. Make changes to code
# (Edit files in lib/)

# 3. Hot reload (press 'r' in terminal)

# 4. Test on device
# (Interact with app)

# 5. Commit changes
git add .
git commit -m "Add feature"
git push

# 6. Build for release
flutter build apk --release
```

---

**Pro Tip**: Bookmark this file! You'll reference it constantly during development. 🚀