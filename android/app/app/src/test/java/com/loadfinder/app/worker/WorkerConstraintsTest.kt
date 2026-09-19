package com.loadfinder.app.worker

import kotlin.test.Test
import kotlin.test.assertTrue

class WorkerConstraintsTest {
    @Test fun networkIsRequiredByDefault() {
        assertTrue(WorkerConstraints().networkRequired)
    }
}
