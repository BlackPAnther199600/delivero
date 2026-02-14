#!/bin/bash
# DELIVERO - APK Build Script
# Build options for Android

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         📱 DELIVERO APK BUILD                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")/mobile" || exit 1

echo "Choose build method:"
echo ""
echo "1️⃣  Build APK with EAS (Recommended)"
echo "   Command: eas build --platform android --local"
echo ""
echo "2️⃣  Test on Web First"
echo "   Command: npm run web"
echo ""
echo "3️⃣  Development with Expo Go"
echo "   Command: npm start"
echo ""

read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo "Installing EAS CLI..."
    npm install -g eas-cli
    echo "Building APK (this may take 5-10 minutes)..."
    eas build --platform android --local
    ;;
  2)
    echo "Starting web preview..."
    npm run web
    ;;
  3)
    echo "Starting Expo development server..."
    npm start
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac
