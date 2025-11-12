#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 Starting Android Emulator for Odanet Mobile"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will:"
echo "  1. Start Expo Metro bundler"
echo "  2. Launch Android emulator"
echo "  3. Install your app on the virtual phone"
echo ""
echo "⚠️  Requirements:"
echo "  - Android Studio must be installed"
echo "  - At least one Android Virtual Device (AVD) created"
echo ""
echo "Starting in 3 seconds..."
sleep 3

npx expo start --android

