package com.loadfinder.app

import org.junit.Assert.assertTrue
import org.junit.Test

class V61ServerPaginationTest {
    @Test fun backend_has_page_contract() {
        val s = java.io.File("../../../../../../../backend/src/server.ts").readText()
        assertTrue(s.contains("/v1/loads/page"))
        assertTrue(s.contains("hasMore"))
        assertTrue(s.contains("pageSize"))
    }
    @Test fun android_api_has_page_response() {
        val s = java.io.File("src/main/java/com/loadfinder/app/data/api/BackendApi.kt").readText()
        assertTrue(s.contains("ApiLoadsPage"))
        assertTrue(s.contains("loadPage"))
    }
    @Test fun repository_supports_page_search() {
        val s = java.io.File("src/main/java/com/loadfinder/app/data/repository/LoadRepository.kt").readText()
        assertTrue(s.contains("searchPage"))
        assertTrue(s.contains("backend.searchLoadsPage"))
    }
    @Test fun ui_supports_incremental_loading() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeViewModel.kt").readText()
        assertTrue(s.contains("fun loadMore()"))
        val ui = java.io.File("src/main/java/com/loadfinder/app/ui/HomeScreen.kt").readText()
        assertTrue(ui.contains("Load more"))
        assertTrue(ui.contains("key = { it.id }"))
    }
}
