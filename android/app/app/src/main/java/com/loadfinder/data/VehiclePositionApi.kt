package com.loadfinder.data

import retrofit2.http.Body
import retrofit2.http.POST

data class VehiclePositionRequest(
    val driverId: String,
    val lat: Double,
    val lon: Double,
    val accuracyM: Float? = null,
    val speedKmh: Double? = null,
    val headingDeg: Double? = null,
    val recordedAt: String
)

interface VehiclePositionApi {
    @POST("/v1/vehicle/position")
    suspend fun update(@Body body: VehiclePositionRequest): Map<String, Any?>
}
