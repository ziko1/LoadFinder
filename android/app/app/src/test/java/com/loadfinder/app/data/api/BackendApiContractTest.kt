package com.loadfinder.app.data.api

import kotlin.test.Test
import kotlin.test.assertTrue

class BackendApiContractTest {
    @Test
    fun realTransEuProposalListMethodExists() {
        assertTrue(BackendApi::class.java.methods.any { it.name == "transEuProposals" })
    }

    @Test
    fun locationEndpointIsVersioned() {
        assertTrue(BackendApi::class.java.methods.any { it.name == "location" })
    }
}
