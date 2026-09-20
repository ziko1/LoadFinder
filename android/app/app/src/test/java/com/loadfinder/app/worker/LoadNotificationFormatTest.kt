package com.loadfinder.app.worker

import com.loadfinder.app.notifications.LoadNotificationFormat
import kotlin.test.Test
import kotlin.test.assertEquals

class LoadNotificationFormatTest {
    @Test
    fun priceFormattingUsesStableEurDigits() {
        assertEquals("123", LoadNotificationFormat.priceEur(123.49))
        assertEquals("124", LoadNotificationFormat.priceEur(123.5))
    }
}
