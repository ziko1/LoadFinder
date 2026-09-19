package com.loadfinder.app

import org.junit.Assert.assertTrue
import org.junit.Test

class V73AutoSearchCancelTest {
    @Test fun scheduler_declares_and_cancels_periodic_and_refresh_work() {
        val f = java.io.File("../../../../main/java/com/loadfinder/app/worker/AutoSearchScheduler.kt")
        assertTrue(f.exists())
        val s = f.readText()
        assertTrue(s.contains("cancelUniqueWork(AutoSearchWorker.WORK_NAME)"))
        assertTrue(s.contains("cancelUniqueWork(REFRESH_WORK_NAME)"))
    }
}
