#!/bin/bash
# Copy custom app icons after npx cap add android
set -e

ANDROID_RES="android/app/src/main/res"

# Copy mipmap PNGs for each density
for density in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
  src="resources/icons/mipmap-${density}"
  dst="${ANDROID_RES}/mipmap-${density}"
  if [ -d "$src" ]; then
    cp "$src/ic_launcher.png" "$dst/ic_launcher.png"
    cp "$src/ic_launcher_round.png" "$dst/ic_launcher_round.png"
  fi
done

# Remove adaptive icon XML so devices fall back to plain PNGs
rm -rf "${ANDROID_RES}/mipmap-anydpi-v26"

# Set background color (solid white)
echo '<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>' > "${ANDROID_RES}/values/ic_launcher_background.xml"
