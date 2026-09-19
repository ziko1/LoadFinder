from pathlib import Path
root = Path(__file__).resolve().parent
build = root / "build.gradle.kts"
manifest = root / "src/main/AndroidManifest.xml"
assert build.exists() and manifest.exists()
a = build.read_text()
m = manifest.read_text()
assert 'id("com.android.application")' in a
assert 'id("org.jetbrains.kotlin.android")' in a
assert 'id("com.google.dagger.hilt.android")' in a
assert 'id("com.google.devtools.ksp")' in a
assert 'androidx.paging:paging-runtime:3.5.1' in a
assert 'androidx.paging:paging-compose:3.5.1' in a
assert 'play-services-location:21.3.0' in a
assert 'ksp("androidx.room:room-compiler:2.6.1")' in a
assert 'ksp("com.google.dagger:hilt-compiler:2.53.1")' in a
assert 'buildConfigField("String", "LOADFINDER_BASE_URL", "\\\"${project.findProperty("LOADFINDER_BASE_URL") ?: ""}\\\"")' in a
assert 'FOREGROUND_SERVICE_LOCATION' in m
assert 'android:foregroundServiceType="location"' in m
svc=root/"src/main/java/com/loadfinder/app/location/LocationForegroundService.kt"
vm=root/"src/main/java/com/loadfinder/app/ui/HomeViewModel.kt"
assert '@AndroidEntryPoint' in svc.read_text()
assert '@HiltViewModel' in vm.read_text()
print("V68 BUILD PREFLIGHT PASS")
