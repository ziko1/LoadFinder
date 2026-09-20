package com.loadfinder.app
import org.junit.Test
import org.junit.Assert.assertTrue
class V58ForegroundLocationTest {
    @Test fun service_uses_explicit_location_foreground_type() {
        val s = java.io.File("src/main/java/com/loadfinder/app/location/LocationForegroundService.kt").readText()
        assertTrue(s.contains("FOREGROUND_SERVICE_TYPE_LOCATION"))
        assertTrue(s.contains("ServiceCompat.startForeground"))
        assertTrue(s.contains("ACCESS_COARSE_LOCATION"))
    }
    @Test fun tracking_is_started_by_explicit_ui_action() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeScreen.kt").readText()
        assertTrue(s.contains("Start live GPS"))
        assertTrue(s.contains("Stop live GPS"))
        val vm = java.io.File("src/main/java/com/loadfinder/app/ui/HomeViewModel.kt").readText()
        assertTrue(vm.contains("ContextCompat.startForegroundService"))
    }
}
