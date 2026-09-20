package com.loadfinder.app.domain.usecase

import com.loadfinder.app.domain.model.Load
import com.loadfinder.app.domain.model.SearchSettings
import kotlin.math.roundToInt

class MatchScoreCalculator {
    fun calculate(load: Load, settings: SearchSettings): Int {
        var score = 0.0
        val radius = settings.radiusKm.coerceAtLeast(0.001)
        val maxEmpty = settings.maxEmptyKm.coerceAtLeast(0.001)
        score += (1.0 - (load.pickupDistanceKm / radius).coerceIn(0.0, 1.0)) * 30
        score += if (load.vehicleType.equals(settings.vehicleType, true)) 25 else 0
        score += if (load.pricePerKm >= settings.minPricePerKm) 25 else 10
        score += (1.0 - (load.emptyDistanceKm / maxEmpty).coerceIn(0.0, 1.0)) * 20
        return score.roundToInt().coerceIn(0, 100)
    }
}
