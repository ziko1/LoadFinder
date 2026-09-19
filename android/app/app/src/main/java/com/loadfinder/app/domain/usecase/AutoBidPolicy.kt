package com.loadfinder.app.domain.usecase

import com.loadfinder.app.domain.model.Load
import com.loadfinder.app.domain.model.SearchSettings

data class BidDecision(
    val eligible: Boolean,
    val amountEur: Double?,
    val reason: String
)

class AutoBidPolicy {
    fun evaluate(load: Load, settings: SearchSettings, targetMarginPercent: Double = 0.05): BidDecision {
        if (load.status != "AVAILABLE") return BidDecision(false, null, "Load is not available")
        if (load.pickupDistanceKm > settings.radiusKm) return BidDecision(false, null, "Pickup outside radius")
        if (load.emptyDistanceKm > settings.maxEmptyKm) return BidDecision(false, null, "Empty distance too high")
        if (load.pricePerKm < settings.minPricePerKm) return BidDecision(false, null, "€/km below minimum")
        if (load.matchScore < settings.minMatchScore) return BidDecision(false, null, "Match score too low")

        // Conservative default: never bid above the published price.
        val recommended = (load.priceEur * (1.0 - targetMarginPercent)).coerceAtLeast(settings.minPriceEur)
        return BidDecision(true, recommended, "All rules passed")
    }
}
