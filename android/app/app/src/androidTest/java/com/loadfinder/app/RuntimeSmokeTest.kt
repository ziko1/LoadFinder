package com.loadfinder.app

import androidx.compose.ui.test.assertIsNotEnabled
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkInfo
import androidx.work.WorkManager
import com.loadfinder.app.data.api.ApiAuthStore
import com.loadfinder.app.worker.AutoSearchWorker
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull

@RunWith(AndroidJUnit4::class)
class RuntimeSmokeTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()

    @Test fun appStartsWithoutExternalCredentials() {
        compose.onNodeWithText("LoadFinder").assertExists()
        compose.onNodeWithText("Увійти").assertExists().assertIsNotEnabled()
    }

    @Test fun authStateSurvivesStoreRecreationAndClearsOnLogout() {
        val context = compose.activity.applicationContext
        ApiAuthStore(context).setAuthState("{\"test\":\"state\"}")
        assertEquals("{\"test\":\"state\"}", ApiAuthStore(context).getAuthState())
        ApiAuthStore(context).clear()
        assertNull(ApiAuthStore(context).getAuthState())
    }

    @Test fun workManagerCreatesInjectedWorker() {
        val work = OneTimeWorkRequestBuilder<AutoSearchWorker>().build()
        val manager = WorkManager.getInstance(compose.activity.applicationContext)
        manager.enqueue(work).result.get()
        compose.waitUntil(20000) { manager.getWorkInfoById(work.id).get()?.state?.isFinished == true }
        assertEquals(WorkInfo.State.SUCCEEDED, manager.getWorkInfoById(work.id).get()?.state)
    }
}
