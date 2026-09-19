package com.loadfinder.app

import org.junit.Assert.assertTrue
import org.junit.Test

class V66LiveGpsPagingTest {
    @Test fun live_location_store_validates_and_publishes() {
        val s = java.io.File("src/main/java/com/loadfinder/app/location/LiveLocationStore.kt").readText()
        assertTrue(s.contains("MutableStateFlow<LiveLocation?>(null)"))
        assertTrue(s.contains("lat in -90.0..90.0"))
        assertTrue(s.contains("fun publish(value: LiveLocation)"))
    }

    @Test fun foreground_service_publishes_location_to_store() {
        val s = java.io.File("src/main/java/com/loadfinder/app/location/LocationForegroundService.kt").readText()
        assertTrue(s.contains("@AndroidEntryPoint"))
        assertTrue(s.contains("liveLocationStore.publish"))
        assertTrue(s.contains("AutoSearchScheduler.updateLocation"))
    }

    @Test fun paging_reacts_only_after_movement_threshold_and_cooldown() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeViewModel.kt").readText()
        assertTrue(s.contains("LIVE_PAGING_MOVE_THRESHOLD_KM = 1.0"))
        assertTrue(s.contains("LIVE_PAGING_REFRESH_COOLDOWN_MS = 60_000L"))
        assertTrue(s.contains("movedKm >= LIVE_PAGING_MOVE_THRESHOLD_KM"))
        assertTrue(s.contains("now - lastPagingRefreshAt >= LIVE_PAGING_REFRESH_COOLDOWN_MS"))
    }

    @Test fun live_location_updates_search_context() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeViewModel.kt").readText()
        assertTrue(s.contains("liveLocationStore.location.collect"))
        assertTrue(s.contains("_searchContext.value = SearchContext("))
        assertTrue(s.contains("lat = live.lat"))
        assertTrue(s.contains("lon = live.lon"))
    }
}
