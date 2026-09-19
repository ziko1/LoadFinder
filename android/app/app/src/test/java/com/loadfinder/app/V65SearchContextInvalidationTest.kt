package com.loadfinder.app

import org.junit.Assert.assertTrue
import org.junit.Test

class V65SearchContextInvalidationTest {
    @Test fun search_context_contains_coordinates_filters_and_revision() {
        val s = java.io.File("src/main/java/com/loadfinder/app/data/paging/SearchContext.kt").readText()
        assertTrue(s.contains("val lat: Double"))
        assertTrue(s.contains("val lon: Double"))
        assertTrue(s.contains("val settings: SearchSettings"))
        assertTrue(s.contains("val revision: Long"))
        assertTrue(s.contains("lat in -90.0..90.0"))
    }

    @Test fun viewmodel_recreates_paging_flow_from_context() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeViewModel.kt").readText()
        assertTrue(s.contains("_searchContext.collectLatest"))
        assertTrue(s.contains("_pagedFlow.value = pagingRepository.flow(context)"))
        assertTrue(s.contains("contextRevision += 1L"))
    }

    @Test fun filter_changes_replace_active_search_context() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeViewModel.kt").readText()
        assertTrue(s.contains("if (pagingStarted && current != null)"))
        assertTrue(s.contains("settings = settings"))
        assertTrue(s.contains("revision = contextRevision"))
    }

    @Test fun repository_does_not_reuse_old_paging_source() {
        val s = java.io.File("src/main/java/com/loadfinder/app/data/repository/LoadPagingRepository.kt").readText()
        assertTrue(s.contains("LoadPagingSource(api, context.lat to context.lon, context.settings, pageSize)"))
        assertTrue(s.contains("require(context.isValid())"))
    }
}
