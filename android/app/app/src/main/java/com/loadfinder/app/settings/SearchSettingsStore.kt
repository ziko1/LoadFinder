package com.loadfinder.app.settings

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import com.loadfinder.app.domain.model.SearchSettings

@Singleton
class SearchSettingsStore @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val prefs by lazy { context.getSharedPreferences("search_settings", Context.MODE_PRIVATE) }

    fun get(): SearchSettings = SearchSettings(
        radiusKm = readDouble(KEY_RADIUS, 100.0),
        minPriceEur = readDouble(KEY_MIN_PRICE, 0.0),
        minPricePerKm = readDouble(KEY_MIN_KM, 1.20),
        maxEmptyKm = readDouble(KEY_MAX_EMPTY, 50.0),
        minMatchScore = prefs.getInt(KEY_MIN_SCORE, 80),
        vehicleType = prefs.getString(KEY_VEHICLE, "VAN") ?: "VAN",
        destination = prefs.getString(KEY_DESTINATION, null)
    )

    fun save(settings: SearchSettings) {
        prefs.edit()
            .putString(KEY_RADIUS, settings.radiusKm.toString())
            .putString(KEY_MIN_PRICE, settings.minPriceEur.toString())
            .putString(KEY_MIN_KM, settings.minPricePerKm.toString())
            .putString(KEY_MAX_EMPTY, settings.maxEmptyKm.toString())
            .putInt(KEY_MIN_SCORE, settings.minMatchScore)
            .putString(KEY_VEHICLE, settings.vehicleType)
            .putString(KEY_DESTINATION, settings.destination)
            .apply()
    }

    private fun readDouble(key: String, default: Double): Double {
        val stringValue = runCatching { prefs.getString(key, null) }.getOrNull()
        if (stringValue != null) return stringValue.toDoubleOrNull() ?: default

        // Backward compatibility with v38 and earlier Float-backed preferences.
        val legacyFloat = runCatching { prefs.getFloat(key, Float.NaN) }.getOrNull()
        if (legacyFloat != null && !legacyFloat.isNaN()) {
            val migrated = legacyFloat.toDouble()
            prefs.edit().putString(key, migrated.toString()).apply()
            return migrated
        }
        return default
    }

    companion object {
        private const val KEY_RADIUS = "radius_km"
        private const val KEY_MIN_PRICE = "min_price_eur"
        private const val KEY_MIN_KM = "min_price_per_km"
        private const val KEY_MAX_EMPTY = "max_empty_km"
        private const val KEY_MIN_SCORE = "min_match_score"
        private const val KEY_VEHICLE = "vehicle_type"
        private const val KEY_DESTINATION = "destination"
    }
}
