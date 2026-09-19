package com.loadfinder.app

import org.junit.Assert.assertTrue
import org.junit.Test

class V69BuildBootstrapTest {
    @Test fun critical_build_dependencies_remain_declared() {
        val a = java.io.File("../build.gradle.kts").readText()
        assertTrue(a.contains("androidx.paging:paging-runtime:3.5.1"))
        assertTrue(a.contains("androidx.paging:paging-compose:3.5.1"))
        assertTrue(a.contains("play-services-location:21.3.0"))
        assertTrue(a.contains("com.google.dagger:hilt-compiler:2.53.1"))
    }
    @Test fun build_config_string_syntax_regression_is_absent() {
        val a = java.io.File("../build.gradle.kts").readText()
        assertTrue(!a.contains("buildConfigField("String", "LOADFINDER_BASE_URL", """))
    }
}
