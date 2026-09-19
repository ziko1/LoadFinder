package com.loadfinder.app.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.loadfinder.app.data.repository.LoadRepository
import com.loadfinder.app.settings.SearchSettingsStore
import com.loadfinder.app.notifications.LoadNotificationHelper
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.CancellationException

@HiltWorker
class AutoSearchWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val repository: LoadRepository,
    private val settingsStore: SearchSettingsStore,
    private val stateStore: AutoSearchStateStore,
    private val resultStore: AutoSearchResultStore,
    private val seenLoadIdsStore: SeenLoadIdsStore
) : CoroutineWorker(appContext, workerParams) {
    override suspend fun doWork(): Result {
        if (!stateStore.isEnabled()) return Result.success()
        val persisted = stateStore.lastLocation()
        val lat = persisted?.lat ?: inputData.getDouble(KEY_LAT, Double.NaN)
        val lon = persisted?.lon ?: inputData.getDouble(KEY_LON, Double.NaN)
        if (!lat.isFinite() || !lon.isFinite()) return Result.failure()

        return try {
            val loads = repository.search(lat, lon, settingsStore.get())
            stateStore.setLastSearchLocation(lat, lon)
            stateStore.setLastAutoSearchAt(System.currentTimeMillis())
            val seenIds = seenLoadIdsStore.get()
            val newLoads = NotificationCandidatePolicy.newLoads(loads, seenIds)

            // Save replaces the previous result snapshot, so UI never mixes two GPS positions.
            resultStore.save(loads)
            // Keep notification history independent from the capped 100-result UI cache.
            // Mark only after notification dispatch succeeds, so a transient notification
            // failure does not permanently suppress the alert.
            LoadNotificationHelper.notifyNewMatches(applicationContext, newLoads)
            seenLoadIdsStore.markSeen(loads.map { it.id })
            Result.success()
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (_: Throwable) {
            if (runAttemptCount < MAX_RETRIES) Result.retry() else Result.failure()
        }
    }

    companion object {
        const val WORK_NAME = "loadfinder-auto-search"
        const val KEY_LAT = "lat"
        const val KEY_LON = "lon"
        private const val MAX_RETRIES = 3
    }
}
