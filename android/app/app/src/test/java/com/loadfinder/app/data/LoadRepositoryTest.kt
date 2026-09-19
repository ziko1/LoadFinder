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

class LoadRepositoryTest {
    private fun load(id: String, pickupKm: Double, emptyKm: Double, pricePerKm: Double) = Load(
        id = id, exchange = "TEST", pickupCity = "Berlin", pickup = GeoPoint(52.52, 13.405),
        deliveryCity = "Hamburg", delivery = GeoPoint(53.55, 10.0), weightKg = 1000,
        volumeM3 = 5.0, vehicleType = "VAN", priceEur = 1000.0, distanceKm = 300.0,
        pickupDistanceKm = pickupKm, emptyDistanceKm = emptyKm, pricePerKm = pricePerKm, matchScore = 0
    )

    @Test
    fun filtersByEmptyDistanceAndPricePerKm() = runTest {
        val adapter = object : ExchangeAdapter {
            override val name = "TEST"
            override suspend fun searchLoads(lat: Double, lon: Double) = listOf(
                load("ok", 20.0, 20.0, 2.0),
                load("too-far-empty", 20.0, 80.0, 2.0),
                load("too-cheap", 20.0, 20.0, 0.8)
            )
            override suspend fun getLoadDetails(loadId: String) = null
            override suspend fun submitOffer(loadId: String, amountEur: Double) = Result.success("x")
            override suspend fun acceptLoad(loadId: String) = Result.success("x")
        }
        val repo = LoadRepository(setOf(adapter), MatchScoreCalculator())
        val result = repo.search(52.52, 13.405, SearchSettings(minPricePerKm = 1.2, maxEmptyKm = 50.0, minMatchScore = 0))
        assertEquals(listOf("ok"), result.map { it.id })
    }
}
