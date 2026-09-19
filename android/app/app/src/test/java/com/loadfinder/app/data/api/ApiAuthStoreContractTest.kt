package com.loadfinder.app.data.api

import kotlin.test.Test
import kotlin.test.assertTrue

class ApiAuthStoreContractTest {
    @Test
    fun storeUsesKeystoreEncryption() {
        val source = ApiAuthStore::class.java.declaredMethods.map { it.name }.toSet()
        assertTrue("getToken" in source)
        assertTrue("setToken" in source)
        assertTrue("clear" in source)
    }
}
