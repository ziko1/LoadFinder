package com.loadfinder.app.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.loadfinder.app.domain.model.Load

object LoadNotificationHelper {
    private const val CHANNEL_ID = "load_matches"
    private const val CHANNEL_NAME = "Load matches"
    private const val SUMMARY_ID = 7000

    fun ensureChannel(context: Context) {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(
            NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "New LoadFinder matches"
            }
        )
    }

    fun notifyNewMatches(context: Context, loads: List<Load>) {
        if (loads.isEmpty()) return
        ensureChannel(context)
        val manager = NotificationManagerCompat.from(context)
        if (!manager.areNotificationsEnabled()) return

        val top = loads.take(3)
        val title = if (loads.size == 1) "New LoadFinder match" else "${loads.size} new LoadFinder matches"
        val body = top.joinToString(" • ") {
            "${it.pickupCity} → ${it.deliveryCity} €${LoadNotificationFormat.priceEur(it.priceEur)}"
        }

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_map)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()

        manager.notify(SUMMARY_ID, notification)
    }
}
