package com.loadfinder.app.data

import com.loadfinder.app.data.exchange.ExchangeAdapter
import com.loadfinder.app.data.repository.LoadRepository
import com.loadfinder.app.domain.model.GeoPoint
import com.loadfinder.app.domain.model.Load
import com.loadfinder.app.domain.model.SearchSettings
import com.loadfinder.app.domain.usecase.MatchScoreCalculator
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals

class LoadRepositoryDestinationAndVehicleTest {
    @Test
    fun destinationAndVehicleFiltersAreApplied() = runTest {
        fun load(id: String, destination: String, vehicle: String) = Load(
            id = id, exchange = "TEST",
            pickupCity = "Berlin", pickup = GeoPoint(52.52, 13.405),
            deliveryCity = destination, delivery = GeoPoint(53.55, 10.0),
            weightKg = 1000, volumeM3 = 5.0, vehicleType = vehicle,
            priceEur = 1000.0, distanceKm = 300.0,
            pickupDistanceKm = 10.0, emptyDistanceKm = 10.0,
            pricePerKm = 2.0, matchScore = 0
        )
        val adapter = object : ExchangeAdapter {
            override val name = "TEST"
            override suspend fun searchLoads(lat: Double, lon: Double) =
                listOf(
                    load("ok", "Hamburg", "VAN"),
                    load("wrong-city", "Munich", "VAN"),
                    load("wrong-vehicle", "Hamburg", "TRUCK")
                )
            override suspend fun getLoadDetails(loadId: String) = null
            override suspend fun submitOffer(loadId: String, amountEur: Double) = Result.success("x")
            override suspend fun acceptLoad(loadId: String) = Result.success("x")
        }
        val repo = LoadRepository(setOf(adapter), MatchScoreCalculator())
        val result = repo.search(
            52.52, 13.405,
            SearchSettings(minMatchScore = 0, destination = "hamburg", vehicleType = "VAN")
        )
        assertEquals(listOf("ok"), result.map { it.id })
    }
}
