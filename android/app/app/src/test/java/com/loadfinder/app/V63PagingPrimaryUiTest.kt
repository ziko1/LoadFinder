package com.loadfinder.app

import org.junit.Assert.assertTrue
import org.junit.Test

class V63PagingPrimaryUiTest {
    @Test fun view_model_exposes_reactive_paging_flow() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeViewModel.kt").readText()
        assertTrue(s.contains("MutableStateFlow<Flow<PagingData<Load>>>"))
        assertTrue(s.contains("_pagedFlow.value = pagingRepository.flow"))
        assertTrue(s.contains("fun refreshPagedSearch()"))
    }
    @Test fun ui_collects_reactive_flow_and_handles_load_states() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeScreen.kt").readText()
        assertTrue(s.contains("pagedFlow by vm.pagedFlow.collectAsState()"))
        assertTrue(s.contains("collectAsLazyPagingItems()"))
        assertTrue(s.contains("pagedItems.retry()"))
        assertTrue(s.contains("pagedItems.refresh()"))
        assertTrue(s.contains("LoadState.Error"))
    }
    @Test fun primary_ui_no_longer_exposes_manual_load_more_button() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeScreen.kt").readText()
        assertTrue(!s.contains("Text(\"Load more\")"))
    }
}
