package com.loadfinder.app
import org.junit.Test
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
class V57LocationFlowTest {
    @Test fun search_has_no_hardcoded_berlin_fallback() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeViewModel.kt").readText()
        assertFalse(s.contains("52.52"))
        assertFalse(s.contains("13.405"))
        assertTrue(s.contains("locationProvider.current()"))
    }
    @Test fun ui_requests_location_permission_before_search() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeScreen.kt").readText()
        assertTrue(s.contains("RequestMultiplePermissions"))
        assertTrue(s.contains("Enable GPS location"))
        assertTrue(s.contains("!state.searching && locationPermissionGranted"))
    }
}
