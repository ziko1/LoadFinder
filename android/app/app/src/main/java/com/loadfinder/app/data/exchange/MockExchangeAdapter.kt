package com.loadfinder.app.data.exchange

import com.loadfinder.app.domain.model.GeoPoint
import com.loadfinder.app.domain.model.Load
import com.loadfinder.app.domain.util.Geo
import javax.inject.Inject

class MockExchangeAdapter @Inject constructor() : ExchangeAdapter {
    override val name = "MOCK"

    override suspend fun searchLoads(lat: Double, lon: Double): List<Load> {
        val here = GeoPoint(lat, lon)
        val raw = listOf(
            Load("MOCK-1", name, "Berlin", GeoPoint(52.52,13.405), "Brussels", GeoPoint(50.85,4.35),
                1200, 8.0, "VAN", 780.0, 650.0, 24.0, 24.0, 1.20, 0),
            Load("MOCK-2", name, "Potsdam", GeoPoint(52.40,13.06), "Hamburg", GeoPoint(53.55,9.99),
                800, 5.0, "VAN", 620.0, 290.0, 35.0, 35.0, 2.14, 0),
            Load("MOCK-3", name, "Berlin", GeoPoint(52.50,13.40), "Munich", GeoPoint(48.14,11.58),
                1500, 10.0, "TRUCK", 900.0, 585.0, 5.0, 5.0, 1.54, 0)
        )
        return raw.map {
            it.copy(
                pickupDistanceKm = Geo.distanceKm(here, it.pickup),
                emptyDistanceKm = Geo.distanceKm(here, it.pickup)
            )
        }
    }

    override suspend fun getLoadDetails(loadId: String): Load? =
        searchLoads(52.52, 13.405).firstOrNull { it.id == loadId }

    override suspend fun submitOffer(loadId: String, amountEur: Double, confirmed: Boolean): Result<String> =
        if (!confirmed) Result.failure(IllegalStateException("EXPLICIT_CONFIRMATION_REQUIRED")) else Result.success("MOCK-OFFER-$loadId-${amountEur.toInt()}")

    override suspend fun acceptLoad(loadId: String, confirmed: Boolean): Result<String> =
        if (!confirmed) Result.failure(IllegalStateException("EXPLICIT_CONFIRMATION_REQUIRED")) else Result.success("MOCK-BOOKING-$loadId")
}
