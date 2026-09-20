package com.loadfinder.app

import org.junit.Assert.assertTrue
import org.junit.Test

class V60ResultsPipelineTest {
    @Test fun result_store_exposes_revision_and_timestamp() {
        val s = java.io.File("src/main/java/com/loadfinder/app/worker/AutoSearchResultStore.kt").readText()
        assertTrue(s.contains("StateFlow<Long>"))
        assertTrue(s.contains("KEY_UPDATED_AT"))
        assertTrue(s.contains("KEY_REVISION"))
        assertTrue(s.contains("_revision.value = nextRevision"))
    }

    @Test fun view_model_observes_result_store_updates() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeViewModel.kt").readText()
        assertTrue(s.contains("resultStore.revision.collect"))
        assertTrue(s.contains("resultStore.lastUpdatedAt()"))
        assertTrue(s.contains("fun refreshSearch()"))
    }

    @Test fun worker_replaces_previous_snapshot() {
        val s = java.io.File("src/main/java/com/loadfinder/app/worker/AutoSearchWorker.kt").readText()
        assertTrue(s.contains("Save replaces the previous result snapshot"))
        assertTrue(s.contains("resultStore.save(loads)"))
    }

    @Test fun ui_has_explicit_refresh_and_freshness_indicator() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeScreen.kt").readText()
        assertTrue(s.contains("Refresh results"))
        assertTrue(s.contains("Results updated:"))
    }
}
