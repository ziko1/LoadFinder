package com.loadfinder.app.worker

import android.content.Context
import androidx.work.Constraints
import androidx.work.Data
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.ExistingWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

object AutoSearchScheduler {
    fun schedule(context: Context, lat: Double, lon: Double) {
        require(lat.isFinite() && lon.isFinite()) { "Valid GPS coordinates are required" }
        val stateStore = AutoSearchStateStore(context.applicationContext)
        stateStore.setEnabled(true)
        stateStore.setLastLocation(lat, lon)

        val input = Data.Builder()
            .putDouble(AutoSearchWorker.KEY_LAT, lat)
            .putDouble(AutoSearchWorker.KEY_LON, lon)
            .build()

        val request = PeriodicWorkRequestBuilder<AutoSearchWorker>(15, TimeUnit.MINUTES)
            .setInputData(input)
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()
            )
            .build()

        WorkManager.getInstance(context.applicationContext).enqueueUniquePeriodicWork(
            AutoSearchWorker.WORK_NAME,
            ExistingPeriodicWorkPolicy.UPDATE,
            request
        )
    }

    fun updateLocation(context: Context, lat: Double, lon: Double) {
        if (!lat.isFinite() || !lon.isFinite()) return
        val appContext = context.applicationContext
        val state = AutoSearchStateStore(appContext)
        state.setLastLocation(lat, lon)
        if (!state.isEnabled()) return

        val previous = state.lastSearchLocation()
        val movedKm = previous?.let { distanceKm(it.lat, it.lon, lat, lon) } ?: Double.POSITIVE_INFINITY
        val cooldownOk = System.currentTimeMillis() - state.lastAutoSearchAt() >= SEARCH_COOLDOWN_MS
        if (movedKm >= SEARCH_MOVE_THRESHOLD_KM && cooldownOk) {
            val request = OneTimeWorkRequestBuilder<AutoSearchWorker>()
                .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                .build()
            WorkManager.getInstance(appContext).enqueueUniqueWork(
                REFRESH_WORK_NAME,
                ExistingWorkPolicy.KEEP,
                request
            )
        }
    }

    private fun distanceKm(aLat: Double, aLon: Double, bLat: Double, bLon: Double): Double {
        val earth = 6371.0088
        val dLat = Math.toRadians(bLat - aLat)
        val dLon = Math.toRadians(bLon - aLon)
        val x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(Math.toRadians(aLat)) * Math.cos(Math.toRadians(bLat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        return earth * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
    }

    const val REFRESH_WORK_NAME = "loadfinder-auto-search-refresh"
    private const val SEARCH_MOVE_THRESHOLD_KM = 5.0
    private const val SEARCH_COOLDOWN_MS = 5 * 60 * 1000L

    fun cancel(context: Context) {
        val appContext = context.applicationContext
        AutoSearchStateStore(appContext).setEnabled(false)
        val workManager = WorkManager.getInstance(appContext)
        workManager.cancelUniqueWork(AutoSearchWorker.WORK_NAME)
        workManager.cancelUniqueWork(REFRESH_WORK_NAME)
    }
}
