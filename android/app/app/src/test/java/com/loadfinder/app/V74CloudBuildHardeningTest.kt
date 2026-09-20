package com.loadfinder.app

import org.junit.Assert.assertTrue
import org.junit.Test

class V74CloudBuildHardeningTest {
    @Test
    fun android_workflow_uses_cloud_gradle_and_expected_build_steps() {
        val workflow = java.io.File("../../../.github/workflows/ci.yml")
        assertTrue(workflow.exists())
        val s = workflow.readText()
        assertTrue(s.contains("gradle/actions/setup-gradle@v4"))
        assertTrue(s.contains("./gradlew :app:assembleDebug :app:testDebugUnitTest --stacktrace"))
        assertTrue(s.contains("working-directory: android"))
    }
}
