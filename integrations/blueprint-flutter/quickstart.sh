#!/bin/bash

# 🚀 Exotic Car Assistant - Quick Start Script
# This script automates the initial setup process

echo "=========================================="
echo "  Exotic Car Assistant - Quick Start"
echo "=========================================="
echo ""

# Check if Flutter is installed
echo "📱 Checking Flutter installation..."
if ! command -v flutter &> /dev/null
then
    echo "❌ Flutter not found! Please install Flutter 3.0+ from https://flutter.dev"
    exit 1
fi
echo "✅ Flutter found: $(flutter --version | head -n 1)"
echo ""

# Install dependencies
echo "📦 Installing Flutter dependencies..."
flutter pub get
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Check if .env exists
echo "🔐 Checking environment configuration..."
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo ""
    echo "Please create .env file with your Supabase credentials:"
    echo "  1. Copy .env.example to .env"
    echo "  2. Add your Supabase URL and anon key"
    echo ""
    echo "Get credentials from: https://supabase.com → Your Project → Settings → API"
    echo ""
    read -p "Do you want to create .env now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.example .env
        echo "✅ Created .env file"
        echo "⚠️  Please edit .env and add your Supabase credentials!"
        echo ""
    else
        echo "⚠️  Remember to create .env before running the app!"
    fi
else
    echo "✅ .env file exists"
fi
echo ""

# Check connected devices
echo "📱 Checking connected devices..."
flutter devices
echo ""

echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Make sure .env has your Supabase credentials"
echo "  2. Run the Supabase schema: supabase_schema.sql"
echo "  3. Run the app: flutter run"
echo ""
echo "For detailed instructions, see SETUP_GUIDE.md"
echo ""