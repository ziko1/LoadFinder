package com.loadfinder.data

import retrofit2.http.Body
import retrofit2.http.POST

data class AutoSearchRequest(
    val driverId: String,
    val lat: Double,
    val lon: Double,
    val radiusKm: Double = 100.0,
    val minEurPerKm: Double = 0.8,
    val maxEmptyKm: Double = 100.0,
    val fuelLitersPer100Km: Double = 9.0,
    val fuelPriceEurPerLiter: Double = 1.7,
    val tollsEur: Double = 0.0,
    val driverCostEur: Double = 0.0,
    val otherCostEur: Double = 0.0
)

interface AutoSearchApi {
    @POST("/v1/auto-search")
    suspend fun search(@Body body: AutoSearchRequest): List<Map<String, Any?>>
}
