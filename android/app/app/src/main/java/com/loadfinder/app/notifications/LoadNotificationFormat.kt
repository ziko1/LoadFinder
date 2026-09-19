package com.loadfinder.app.notifications

import java.util.Locale

internal object LoadNotificationFormat {
    fun priceEur(priceEur: Double): String =
        String.format(Locale.ROOT, "%.0f", priceEur)
}
