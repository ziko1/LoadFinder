package com.loadfinder.app.data.exchange

import com.loadfinder.app.data.api.ApiLoad
import com.loadfinder.app.data.api.BackendApi
import com.loadfinder.app.data.api.ConfirmBody
import com.loadfinder.app.data.api.OfferBody
import com.loadfinder.app.domain.model.GeoPoint
import com.loadfinder.app.domain.model.Load
import javax.inject.Inject
import kotlinx.coroutines.CancellationException

class BackendExchangeAdapter @Inject constructor(
    private val api: BackendApi
) : ExchangeAdapter {
    override val name = "BACKEND"

    override suspend fun searchLoads(lat: Double, lon: Double): List<Load> =
        try {
            val defaults = com.loadfinder.app.domain.model.SearchSettings()
            api.loadPage(
                lat = lat,
                lon = lon,
                radiusKm = defaults.radiusKm,
                minPricePerKm = defaults.minPricePerKm,
                maxEmptyKm = defaults.maxEmptyKm,
                minMatchScore = defaults.minMatchScore,
                vehicleType = defaults.vehicleType
            ).items.map(::mapLoad)
        } catch (e: CancellationException) {
            throw e
        }

    override suspend fun searchLoadsPage(
        lat: Double, lon: Double, settings: com.loadfinder.app.domain.model.SearchSettings,
        page: Int, pageSize: Int
    ): ExchangePage {
        val response = api.loadPage(
            lat = lat, lon = lon,
            radiusKm = settings.radiusKm,
            minPricePerKm = settings.minPricePerKm,
            maxEmptyKm = settings.maxEmptyKm,
            minMatchScore = settings.minMatchScore,
            vehicleType = settings.vehicleType,
            page = page, pageSize = pageSize,
            minPriceEur = settings.minPriceEur, destination = settings.destination
        )
        return ExchangePage(
            items = response.items.map(::mapLoad),
            page = response.page,
            pageSize = response.pageSize,
            total = response.total,
            hasMore = response.hasMore
        )
    }

    override suspend fun getLoadDetails(loadId: String): Load? =
        runCatching { api.loadDetails(loadId) }
            .getOrNull()
            ?.let { x ->
                Load(
                    id = x.id,
                    exchange = x.exchange,
                    pickupCity = x.pickupCity,
                    pickup = GeoPoint(x.pickupLat, x.pickupLon),
                    deliveryCity = x.deliveryCity,
                    delivery = GeoPoint(x.deliveryLat, x.deliveryLon),
                    weightKg = x.weightKg,
                    volumeM3 = x.volumeM3,
                    vehicleType = x.vehicleType,
                    priceEur = x.priceEur,
                    distanceKm = x.distanceKm,
                    pickupDistanceKm = x.pickupDistanceKm,
                    emptyDistanceKm = x.emptyDistanceKm,
                    pricePerKm = x.pricePerKm,
                    matchScore = x.matchScore,
                    status = x.status
                )
            }

    override suspend fun submitOffer(loadId: String, amountEur: Double, confirmed: Boolean): Result<String> =
        runCatching {
            require(confirmed) { "EXPLICIT_CONFIRMATION_REQUIRED" }
            api.offer(loadId, OfferBody(amountEur, confirmed = true))["offerId"].orEmpty()
        }

    override suspend fun acceptLoad(loadId: String, confirmed: Boolean): Result<String> =
        runCatching {
            require(confirmed) { "EXPLICIT_CONFIRMATION_REQUIRED" }
            api.accept(loadId, ConfirmBody(confirmed = true))["bookingId"].orEmpty()
        }

    private fun mapLoad(x: ApiLoad) = Load(
        id = x.id,
        exchange = x.exchange,
        pickupCity = x.pickupCity,
        pickup = GeoPoint(x.pickupLat, x.pickupLon),
        deliveryCity = x.deliveryCity,
        delivery = GeoPoint(x.deliveryLat, x.deliveryLon),
        weightKg = x.weightKg,
        volumeM3 = x.volumeM3,
        vehicleType = x.vehicleType,
        priceEur = x.priceEur,
        distanceKm = x.distanceKm,
        pickupDistanceKm = x.pickupDistanceKm,
        emptyDistanceKm = x.emptyDistanceKm,
        pricePerKm = x.pricePerKm,
        matchScore = x.matchScore,
        status = x.status
    )
}
