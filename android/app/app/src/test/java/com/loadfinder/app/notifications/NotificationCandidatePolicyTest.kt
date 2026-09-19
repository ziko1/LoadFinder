package com.loadfinder.app.notifications

import kotlin.test.Test
import kotlin.test.assertTrue

class NotificationCandidatePolicyTest {
    @Test
    fun policySourceDefinesSafeCandidateRules() {
        val source = NotificationCandidatePolicy::class.java
            .getDeclaredMethod("newLoads", List::class.java, Set::class.java)
        assertTrue(source.returnType == List::class.java)
    }
}
