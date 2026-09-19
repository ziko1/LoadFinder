package com.loadfinder.app

import org.junit.Assert.assertTrue
import org.junit.Test

class V74CloudBuildHardeningTest {
    @Test
    fun android_workflow_uses_cloud_gradle_and_expected_build_steps() {
        val workflow = java.io.File("../../../../.github/workflows/android-build.yml")
        assertTrue(workflow.exists())
        val s = workflow.readText()
        assertTrue(s.contains("gradle/actions/setup-gradle@v6"))
        assertTrue(s.contains("gradle-version: \"8.9\""))
        assertTrue(s.contains("gradle :app:assembleDebug --stacktrace"))
        assertTrue(s.contains("gradle :app:testDebugUnitTest --stacktrace"))
        assertTrue(s.contains("actions/upload-artifact@v4"))
    }
}
