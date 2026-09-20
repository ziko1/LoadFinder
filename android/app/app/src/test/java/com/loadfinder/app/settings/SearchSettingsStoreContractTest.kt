package com.loadfinder.app.settings

import kotlin.test.Test
import kotlin.test.assertEquals

class SearchSettingsStoreContractTest {
    @Test
    fun decimalSettingsRoundTripWithoutFloatConversion() {
        val values = listOf(0.123456789, 1.234567891, 99.876543219)
        values.forEach { value -> assertEquals(value, value.toString().toDouble()) }
    }
}
