package com.loadfinder.app

import org.junit.Assert.assertTrue
import org.junit.Test

class V62JetpackPagingTest {
    @Test fun paging_dependencies_are_declared() {
        val s = java.io.File("build.gradle.kts").readText()
        assertTrue(s.contains("androidx.paging:paging-runtime:3.5.1"))
        assertTrue(s.contains("androidx.paging:paging-compose:3.5.1"))
    }
    @Test fun paging_source_uses_backend_page_contract() {
        val s = java.io.File("src/main/java/com/loadfinder/app/data/paging/LoadPagingSource.kt").readText()
        assertTrue(s.contains("PagingSource<Int, Load>"))
        assertTrue(s.contains("api.loadPage"))
        assertTrue(s.contains("response.hasMore"))
    }
    @Test fun paging_repository_creates_pager() {
        val s = java.io.File("src/main/java/com/loadfinder/app/data/repository/LoadPagingRepository.kt").readText()
        assertTrue(s.contains("Pager("))
        assertTrue(s.contains("PagingConfig"))
        assertTrue(s.contains("LoadPagingSource"))
    }
    @Test fun compose_ui_collects_paging_items() {
        val s = java.io.File("src/main/java/com/loadfinder/app/ui/HomeScreen.kt").readText()
        assertTrue(s.contains("collectAsLazyPagingItems"))
        assertTrue(s.contains("pagedItems.itemCount"))
    }
}
