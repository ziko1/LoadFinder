package com.loadfinder.app.domain.model

data class GeoPoint(val lat: Double, val lon: Double)

data class Load(
    val id: String,
    val exchange: String,
    val pickupCity: String,
    val pickup: GeoPoint,
    val deliveryCity: String,
    val delivery: GeoPoint,
    val weightKg: Int,
    val volumeM3: Double,
    val vehicleType: String,
    val priceEur: Double,
    val distanceKm: Double,
    val pickupDistanceKm: Double,
    val emptyDistanceKm: Double,
    val pricePerKm: Double,
    val matchScore: Int,
    val status: String = "AVAILABLE"
)
