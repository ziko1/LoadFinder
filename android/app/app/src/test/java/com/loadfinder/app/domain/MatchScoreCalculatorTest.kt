package com.loadfinder.app.domain

import com.loadfinder.app.domain.model.GeoPoint
import com.loadfinder.app.domain.model.Load
import com.loadfinder.app.domain.model.SearchSettings
import com.loadfinder.app.domain.usecase.MatchScoreCalculator
import kotlin.test.Test
import kotlin.test.assertTrue

class MatchScoreCalculatorTest {
    private val load = Load(
        id = "T1", exchange = "TEST", pickupCity = "Berlin", pickup = GeoPoint(52.52, 13.40),
        deliveryCity = "Hamburg", delivery = GeoPoint(53.55, 10.0), weightKg = 1000,
        volumeM3 = 5.0, vehicleType = "VAN", priceEur = 1000.0, distanceKm = 300.0,
        pickupDistanceKm = 0.0, emptyDistanceKm = 0.0, pricePerKm = 2.0, matchScore = 0
    )

    @Test
    fun zero_limits_do_not_produce_nan_or_infinity() {
        val score = MatchScoreCalculator().calculate(
            load,
            SearchSettings(radiusKm = 0.0, maxEmptyKm = 0.0)
        )
        assertTrue(score in 0..100)
    }
}
