package com.loadfinder.app

import org.junit.Assert.assertTrue
import org.junit.Test

class V64PagingPrimarySearchTest {
    @Test fun search_button_starts_paging_directly() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeScreen.kt").readText()
        assertTrue(s.contains("onClick = { vm.startPagedSearch() }"))
        assertTrue(!s.contains("Text("Start smart paging")"))
    }
    @Test fun primary_ui_does_not_render_duplicate_legacy_result_list() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeScreen.kt").readText()
        assertTrue(!s.contains("Best matches: ${state.loads.size}"))
        assertTrue(s.contains("pagedItems.itemCount"))
    }
    @Test fun refresh_uses_current_paging_session() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeViewModel.kt").readText()
        assertTrue(s.contains("private var pagingStarted = false"))
        assertTrue(s.contains("if (pagingStarted) refreshPagedSearch() else search()"))
    }
}
