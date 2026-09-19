package com.loadfinder.app

import org.junit.Assert.assertTrue
import org.junit.Test

class V67LocationLifecycleTest {
    @Test fun start_checks_runtime_location_permission() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeViewModel.kt").readText()
        assertTrue(s.contains("fun hasLocationPermission(): Boolean"))
        assertTrue(s.contains("if (!hasLocationPermission())"))
        assertTrue(s.contains("startForegroundService"))
    }
    @Test fun permission_state_is_rechecked_on_resume() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeScreen.kt").readText()
        assertTrue(s.contains("locationPermissionGranted = vm.hasLocationPermission()"))
        assertTrue(s.contains("vm.refreshLocationPermissionState()"))
    }
    @Test fun location_settings_entry_is_available() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeScreen.kt").readText()
        val vm = java.io.File("src/main/java/com/loadfinder/app/ui/HomeViewModel.kt").readText()
        assertTrue(s.contains("Open Android Location settings"))
        assertTrue(vm.contains("Settings.ACTION_LOCATION_SOURCE_SETTINGS"))
    }
    @Test fun foreground_service_contract_is_declared() {
        val m = java.io.File("../main/AndroidManifest.xml").readText()
        assertTrue(m.contains("FOREGROUND_SERVICE_LOCATION"))
        assertTrue(m.contains("android:foregroundServiceType="location""))
    }
}
