package com.loadfinder.app.worker

import android.content.Context
import com.loadfinder.app.domain.model.GeoPoint
import com.loadfinder.app.domain.model.Load
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

@Serializable
private data class StoredGeoPoint(val lat: Double, val lon: Double)

@Serializable
private data class StoredLoad(
    val id: String,
    val exchange: String,
    val pickupCity: String,
    val pickup: StoredGeoPoint,
    val deliveryCity: String,
    val delivery: StoredGeoPoint,
    val weightKg: Int,
    val volumeM3: Double,
    val vehicleType: String,
    val priceEur: Double,
    val distanceKm: Double,
    val pickupDistanceKm: Double,
    val emptyDistanceKm: Double,
    val pricePerKm: Double,
    val matchScore: Int,
    val status: String
)

@Singleton
class AutoSearchResultStore @Inject constructor(
    @ApplicationContext context: Context
) {
    private val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    private val json = Json { ignoreUnknownKeys = true }
    private val _revision = MutableStateFlow(prefs.getLong(KEY_REVISION, 0L))
    val revision: StateFlow<Long> = _revision.asStateFlow()

    fun lastUpdatedAt(): Long = prefs.getLong(KEY_UPDATED_AT, 0L)

    fun save(loads: List<Load>) {
        val stored = loads.take(MAX_ITEMS).map { load ->
            StoredLoad(
                id = load.id,
                exchange = load.exchange,
                pickupCity = load.pickupCity,
                pickup = StoredGeoPoint(load.pickup.lat, load.pickup.lon),
                deliveryCity = load.deliveryCity,
                delivery = StoredGeoPoint(load.delivery.lat, load.delivery.lon),
                weightKg = load.weightKg,
                volumeM3 = load.volumeM3,
                vehicleType = load.vehicleType,
                priceEur = load.priceEur,
                distanceKm = load.distanceKm,
                pickupDistanceKm = load.pickupDistanceKm,
                emptyDistanceKm = load.emptyDistanceKm,
                pricePerKm = load.pricePerKm,
                matchScore = load.matchScore,
                status = load.status
            )
        }
        val now = System.currentTimeMillis()
        val nextRevision = _revision.value + 1L
        prefs.edit()
            .putString(KEY_LOADS, json.encodeToString(stored))
            .putLong(KEY_UPDATED_AT, now)
            .putLong(KEY_REVISION, nextRevision)
            .apply()
        _revision.value = nextRevision
    }

    fun get(): List<Load> {
        val raw = prefs.getString(KEY_LOADS, null) ?: return emptyList()
        return runCatching {
            json.decodeFromString<List<StoredLoad>>(raw).map { load ->
                Load(
                    id = load.id,
                    exchange = load.exchange,
                    pickupCity = load.pickupCity,
                    pickup = GeoPoint(load.pickup.lat, load.pickup.lon),
                    deliveryCity = load.deliveryCity,
                    delivery = GeoPoint(load.delivery.lat, load.delivery.lon),
                    weightKg = load.weightKg,
                    volumeM3 = load.volumeM3,
                    vehicleType = load.vehicleType,
                    priceEur = load.priceEur,
                    distanceKm = load.distanceKm,
                    pickupDistanceKm = load.pickupDistanceKm,
                    emptyDistanceKm = load.emptyDistanceKm,
                    pricePerKm = load.pricePerKm,
                    matchScore = load.matchScore,
                    status = load.status
                )
            }
        }.getOrElse { emptyList() }
    }

    companion object {
        private const val PREFS = "auto_search_results"
        private const val KEY_LOADS = "loads_json"
        private const val KEY_UPDATED_AT = "updated_at"
        private const val KEY_REVISION = "revision"
        private const val MAX_ITEMS = 100
    }
}
