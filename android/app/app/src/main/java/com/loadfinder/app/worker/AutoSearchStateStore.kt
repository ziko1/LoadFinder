package com.loadfinder.app.worker

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

data class LastLocation(val lat: Double, val lon: Double)

@Singleton
class AutoSearchStateStore @Inject constructor(
    @ApplicationContext context: Context
) {
    private val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun isEnabled(): Boolean = prefs.getBoolean(KEY_ENABLED, false)

    fun setEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_ENABLED, enabled).apply()
    }

    fun setLastLocation(lat: Double, lon: Double) {
        require(lat.isFinite() && lon.isFinite()) { "Invalid GPS coordinates" }
        prefs.edit()
            .putString(KEY_LAT, lat.toString())
            .putString(KEY_LON, lon.toString())
            .apply()
    }

    fun lastSearchLocation(): LastLocation? {
        val lat = prefs.getString(KEY_SEARCH_LAT, null)?.toDoubleOrNull()
        val lon = prefs.getString(KEY_SEARCH_LON, null)?.toDoubleOrNull()
        return if (lat != null && lon != null && lat.isFinite() && lon.isFinite()) LastLocation(lat, lon) else null
    }

    fun setLastSearchLocation(lat: Double, lon: Double) {
        require(lat.isFinite() && lon.isFinite()) { "Invalid GPS coordinates" }
        prefs.edit().putString(KEY_SEARCH_LAT, lat.toString()).putString(KEY_SEARCH_LON, lon.toString()).apply()
    }

    fun lastAutoSearchAt(): Long = prefs.getLong(KEY_SEARCH_AT, 0L)

    fun setLastAutoSearchAt(value: Long) {
        prefs.edit().putLong(KEY_SEARCH_AT, value).apply()
    }

    fun lastLocation(): LastLocation? {
        val lat = prefs.getString(KEY_LAT, null)?.toDoubleOrNull()
        val lon = prefs.getString(KEY_LON, null)?.toDoubleOrNull()
        return if (lat != null && lon != null && lat.isFinite() && lon.isFinite()) {
            LastLocation(lat, lon)
        } else {
            null
        }
    }

    companion object {
        private const val PREFS = "auto_search"
        private const val KEY_ENABLED = "enabled"
        private const val KEY_LAT = "last_lat"
        private const val KEY_LON = "last_lon"
        private const val KEY_SEARCH_LAT = "last_search_lat"
        private const val KEY_SEARCH_LON = "last_search_lon"
        private const val KEY_SEARCH_AT = "last_search_at"
    }
}
