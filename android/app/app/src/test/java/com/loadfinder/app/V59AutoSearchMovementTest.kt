package com.loadfinder.app
import org.junit.Test
import org.junit.Assert.assertTrue
class V59AutoSearchMovementTest {
    @Test fun gps_updates_can_schedule_refresh_when_auto_search_is_enabled() {
        val s = java.io.File("src/main/java/com/loadfinder/app/worker/AutoSearchScheduler.kt").readText()
        assertTrue(s.contains("SEARCH_MOVE_THRESHOLD_KM"))
        assertTrue(s.contains("enqueueUniqueWork"))
        assertTrue(s.contains("REFRESH_WORK_NAME"))
    }
    @Test fun worker_records_location_actually_used_for_search() {
        val s = java.io.File("src/main/java/com/loadfinder/app/worker/AutoSearchWorker.kt").readText()
        assertTrue(s.contains("setLastSearchLocation(lat, lon)"))
        assertTrue(s.contains("setLastAutoSearchAt"))
    }
    @Test fun ui_exposes_auto_search_start() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeScreen.kt").readText()
        assertTrue(s.contains("Start Auto Search"))
    }
}
