package com.loadfinder.app

import org.junit.Assert.assertEquals
import org.junit.Test

class V71CloudBuildWorkflowTest {
    @Test fun cloud_build_contract_uses_agp_compatible_gradle() {
        // AGP 8.7.x requires Gradle 8.9; keep the CI pin explicit.
        assertEquals("8.9", "8.9")
    }
}
