# 📱 How to Install Flutter on macOS

Flutter is not currently installed on your system. Here's how to install it:

---

## Method 1: Using Homebrew (Recommended)

### Step 1: Install Homebrew (if you don't have it)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 2: Install Flutter
```bash
brew install flutter
```

### Step 3: Verify Installation
```bash
flutter --version
flutter doctor
```

---

## Method 2: Manual Installation

### Step 1: Download Flutter
1. Go to [https://docs.flutter.dev/get-started/install/macos](https://docs.flutter.dev/get-started/install/macos)
2. Download the latest stable release for macOS
3. Extract the file to your desired location (e.g., `~/development/flutter`)

### Step 2: Add Flutter to PATH
Add this line to your `~/.zshrc` file:
```bash
export PATH="$PATH:$HOME/development/flutter/bin"
```

Then reload your shell:
```bash
source ~/.zshrc
```

### Step 3: Verify Installation
```bash
flutter --version
flutter doctor
```

---

## Method 3: Using FVM (Flutter Version Manager)

FVM lets you manage multiple Flutter versions:

```bash
# Install FVM
brew install fvm

# Install Flutter using FVM
fvm install stable

# Use Flutter via FVM
fvm flutter --version
```

---

## After Installation

### 1. Run Flutter Doctor
```bash
flutter doctor
```

This will check your system and tell you what's missing (Xcode, Android Studio, etc.)

### 2. Install Xcode (for iOS development)
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
```

### 3. Install Android Studio (for Android development)
1. Download from [https://developer.android.com/studio](https://developer.android.com/studio)
2. Open Android Studio
3. Go to Settings → Plugins → Install "Flutter" plugin
4. Create an Android emulator

### 4. Accept Licenses
```bash
flutter doctor --android-licenses
```

---

## Quick Install Script

Save this as `install_flutter.sh` and run it:

```bash
#!/bin/bash

echo "🚀 Installing Flutter..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew already installed"
fi

# Install Flutter
echo "📱 Installing Flutter..."
brew install flutter

# Add to PATH
echo "🔧 Adding Flutter to PATH..."
echo 'export PATH="$PATH:$HOME/development/flutter/bin"' >> ~/.zshrc
source ~/.zshrc

# Verify
echo "✅ Verifying installation..."
flutter --version
flutter doctor

echo "🎉 Flutter installation complete!"
```

Run it:
```bash
chmod +x install_flutter.sh
./install_flutter.sh
```

---

## Verify Everything Works

After installation, run these commands:

```bash
# Check Flutter version
flutter --version

# Check for issues
flutter doctor

# List connected devices
flutter devices
```

You should see output like:
```
Flutter 3.24.0 • channel stable • https://github.com/flutter/flutter.git
Framework • revision ...
Engine • revision ...
Tools • Dart 3.5.0 • DevTools 2.34.0

[✓] Flutter (Channel stable, 3.24.0, on macOS 14.5 23F79)
[✓] Xcode - develop for iOS and macOS
[✓] Chrome - develop for the web
[✓] VS Code (version 1.85.0)
```

---

## Then Install Project Dependencies

Once Flutter is installed:

```bash
cd /Users/prestonjaysusanto/blueprint/Blueprint
flutter pub get
```

---

## Troubleshooting

### "flutter: command not found"
- Make sure you added Flutter to PATH
- Restart your terminal
- Run `source ~/.zshrc`

### "Xcode not installed"
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### "Android SDK not found"
- Install Android Studio
- Open Android Studio → Settings → Appearance & Behavior → System Settings → Android SDK
- Install SDK Platform 34

---

## Need Help?

- Flutter Docs: [https://docs.flutter.dev/get-started/install/macos](https://docs.flutter.dev/get-started/install/macos)
- Flutter Discord: [https://discord.gg/flutter](https://discord.gg/flutter)
- Stack Overflow: Tag `flutter`

---

**After installing Flutter, come back and run:**
```bash
flutter pub get