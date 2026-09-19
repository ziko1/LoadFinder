package com.loadfinder.app

import org.junit.Assert.assertTrue
import org.junit.Test

class V68BuildConfigurationTest {
    @Test fun ksp_and_critical_dependencies_are_declared() {
        val app = java.io.File("../build.gradle.kts").readText()
        assertTrue(app.contains("com.google.devtools.ksp"))
        assertTrue(app.contains("androidx.paging:paging-runtime:3.5.1"))
        assertTrue(app.contains("androidx.paging:paging-compose:3.5.1"))
        assertTrue(app.contains("play-services-location:21.3.0"))
        assertTrue(app.contains("ksp(\"com.google.dagger:hilt-compiler:2.53.1\")"))
    }

    @Test fun build_config_string_is_kotlin_dsl_safe() {
        val app = java.io.File("../build.gradle.kts").readText()
        assertTrue(app.contains("buildConfigField(\"String\", \"LOADFINDER_BASE_URL\""))
        assertTrue(!app.contains("buildConfigField(\"String\", \"LOADFINDER_BASE_URL\", \"\""))
    }

    @Test fun location_foreground_service_contract_is_declared() {
        val m = java.io.File("src/main/AndroidManifest.xml").readText()
        assertTrue(m.contains("FOREGROUND_SERVICE_LOCATION"))
        assertTrue(m.contains("android:foregroundServiceType=\"location\""))
    }
}
