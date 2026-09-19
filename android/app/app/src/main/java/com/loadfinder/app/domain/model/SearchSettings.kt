package com.loadfinder.app.domain.model

data class SearchSettings(
    val radiusKm: Double = 100.0,
    val minPriceEur: Double = 0.0,
    val minPricePerKm: Double = 1.20,
    val maxEmptyKm: Double = 50.0,
    val minMatchScore: Int = 80,
    val vehicleType: String = "VAN",
    val destination: String? = null
)
