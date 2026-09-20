#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
APP="$ROOT/app/app"
test -f "$ROOT/settings.gradle.kts"
test -f "$ROOT/build.gradle.kts"
test -f "$APP/build.gradle.kts"
test -f "$APP/src/main/AndroidManifest.xml"
grep -q 'id("com.android.application")' "$APP/build.gradle.kts"
grep -q 'id("org.jetbrains.kotlin.android")' "$APP/build.gradle.kts"
grep -q 'id("org.jetbrains.kotlin.plugin.compose")' "$APP/build.gradle.kts"
grep -q 'id("com.google.dagger.hilt.android")' "$APP/build.gradle.kts"
grep -q 'id("com.google.devtools.ksp")' "$APP/build.gradle.kts"
grep -q 'androidx.paging:paging-runtime:3.5.1' "$APP/build.gradle.kts"
grep -q 'androidx.paging:paging-compose:3.5.1' "$APP/build.gradle.kts"
grep -q 'play-services-location:21.3.0' "$APP/build.gradle.kts"
grep -q 'ksp("com.google.dagger:hilt-compiler:2.53.1")' "$APP/build.gradle.kts"
! grep -q 'buildConfigField("String", "LOADFINDER_BASE_URL", ""' "$APP/build.gradle.kts"
grep -q 'FOREGROUND_SERVICE_LOCATION' "$APP/src/main/AndroidManifest.xml"
grep -q 'android:foregroundServiceType="location"' "$APP/src/main/AndroidManifest.xml"
find "$APP/src/main/java" -name '*.kt' -print0 | xargs -0 grep -L 'TODO()' >/dev/null
printf '%s\n' 'V70 SOURCE BUILD PREFLIGHT PASS'
