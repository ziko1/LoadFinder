plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
    id("com.google.dagger.hilt.android")
    id("com.google.devtools.ksp")
}

if (file("google-services.json").exists()) apply(plugin = "com.google.gms.google-services")
fun configString(name: String, fallback: String = "") =
    "\"" + (project.findProperty(name)?.toString() ?: fallback).replace("\\", "\\\\").replace("\"", "\\\"") + "\""

android {
    buildFeatures { buildConfig = true }
    namespace = "com.loadfinder.app"
    compileSdk = 35

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    defaultConfig {
        manifestPlaceholders["MAPS_API_KEY"] = project.findProperty("MAPS_API_KEY") ?: ""
        manifestPlaceholders["appAuthRedirectScheme"] = "com.loadfinder.app"
        buildConfigField("String", "OIDC_ISSUER", configString("OIDC_ISSUER"))
        buildConfigField("String", "OIDC_CLIENT_ID", configString("OIDC_CLIENT_ID"))
        buildConfigField("String", "OIDC_SCOPES", configString("OIDC_SCOPES", "openid profile offline_access"))
        buildConfigField("boolean", "MAPS_CONFIGURED", "${!project.findProperty("MAPS_API_KEY")?.toString().isNullOrBlank()}")
        buildConfigField("boolean", "FIREBASE_CONFIGURED", "${file("google-services.json").exists()}")
        buildConfigField("String", "LOADFINDER_BASE_URL", "\"${project.findProperty("LOADFINDER_BASE_URL") ?: ""}\"")
        buildConfigField("boolean", "LOADFINDER_USE_MOCK", "${project.findProperty("LOADFINDER_USE_MOCK") ?: "false"}")
        applicationId = "com.loadfinder.app"
        minSdk = 29
        targetSdk = 35
        versionCode = 21
        versionName = "0.21.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
}

dependencies {
    implementation("net.openid:appauth:0.11.1")
    ksp("androidx.hilt:hilt-compiler:1.2.0")
    androidTestImplementation("androidx.test:runner:1.6.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
    implementation(platform("androidx.compose:compose-bom:2025.01.01"))
    androidTestImplementation(platform("androidx.compose:compose-bom:2025.01.01"))
    implementation("androidx.paging:paging-runtime:3.5.1")
    implementation("androidx.paging:paging-compose:3.5.1")
    implementation("com.google.firebase:firebase-messaging-ktx:24.1.2")
    // 6.4.1 is compatible with this project's AGP 8.7 / compileSdk 35 toolchain.
    implementation("com.google.maps.android:maps-compose:6.4.1")
    implementation("com.google.android.gms:play-services-maps:20.0.0")
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.activity:activity-compose:1.10.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3:1.3.1")
    implementation("androidx.compose.ui:ui-tooling-preview")
    debugImplementation("androidx.compose.ui:ui-tooling")

    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")

    implementation("com.google.android.gms:play-services-location:21.3.0")
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.retrofit2:converter-kotlinx-serialization:2.11.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    implementation("com.google.dagger:hilt-android:2.53.1")
    ksp("com.google.dagger:hilt-compiler:2.53.1")
    implementation("androidx.hilt:hilt-navigation-compose:1.2.0")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.9.0")
    implementation("androidx.work:work-runtime-ktx:2.10.0")
    implementation("androidx.hilt:hilt-work:1.2.0")
    testImplementation("org.jetbrains.kotlin:kotlin-test:2.0.21")
}
