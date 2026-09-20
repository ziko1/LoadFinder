package com.loadfinder.app.data.api

import kotlinx.serialization.Serializable
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

@Serializable
data class ApiLoad(
    val id:String,
    val exchange:String,
    val pickupCity:String,
    val deliveryCity:String,
    val priceEur:Double,
    val pickupLat:Double,
    val pickupLon:Double,
    val deliveryLat:Double,
    val deliveryLon:Double,
    val weightKg:Int = 0,
    val volumeM3:Double = 0.0,
    val vehicleType:String = "UNKNOWN",
    val distanceKm:Double,
    val pickupDistanceKm:Double,
    val emptyDistanceKm:Double,
    val pricePerKm:Double,
    val matchScore:Int,
    val status:String
)

@Serializable
data class ApiLoadsPage(
    val items: List<ApiLoad>,
    val page: Int,
    val pageSize: Int,
    val total: Int,
    val hasMore: Boolean
)

@Serializable
data class ApiLoadDetails(
    val id: String,
    val exchange: String,
    val pickupCity: String,
    val deliveryCity: String,
    val priceEur: Double,
    val pickupLat: Double,
    val pickupLon: Double,
    val deliveryLat: Double,
    val deliveryLon: Double,
    val weightKg: Int = 0,
    val volumeM3: Double = 0.0,
    val vehicleType: String = "UNKNOWN",
    val distanceKm: Double = 0.0,
    val pickupDistanceKm: Double = 0.0,
    val emptyDistanceKm: Double = 0.0,
    val pricePerKm: Double = 0.0,
    val matchScore: Int = 0,
    val status: String = "AVAILABLE",
    val offerId: String? = null,
    val version: Int? = null,
    val decisionDate: String? = null,
    val stage: String? = null
)

@Serializable
data class LocationBody(val driverId:String,val lat:Double,val lon:Double)

@Serializable
data class ConfirmBody(val confirmed:Boolean)

@Serializable
data class OfferBody(val amountEur:Double,val confirmed:Boolean)

@Serializable data class PushTokenBody(val token: String, val platform: String = "android")
@Serializable data class ConnectionUrl(val url: String)
@Serializable data class ExchangeStatus(val configured: Boolean, val connected: Boolean)

interface BackendApi {
    @POST("v1/exchanges/trans-eu/connect-url")
    suspend fun connectExchange(): ConnectionUrl
    @GET("v1/exchanges/trans-eu/status")
    suspend fun exchangeStatus(): ExchangeStatus
    @POST("v14/push-token")
    suspend fun registerPush(@Body body: PushTokenBody)
    @POST("v14/push-token/remove")
    suspend fun removePush(@Body body: PushTokenBody)
    @GET("v1/exchanges/trans-eu/proposals")
    suspend fun transEuProposals(
        @Query("page") page: Int = 1,
        @Query("sortBy") sortBy: String = "loading_date",
        @Query("order") order: String = "asc"
    ): List<kotlinx.serialization.json.JsonElement>

    @GET("v1/loads/page")
    suspend fun loadPage(
        @Query("lat") lat: Double,
        @Query("lon") lon: Double,
        @Query("radiusKm") radiusKm: Double,
        @Query("minPricePerKm") minPricePerKm: Double,
        @Query("maxEmptyKm") maxEmptyKm: Double,
        @Query("minMatchScore") minMatchScore: Int,
        @Query("vehicleType") vehicleType: String,
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = 25,
        @Query("minPriceEur") minPriceEur: Double = 0.0,
        @Query("destination") destination: String? = null
    ): ApiLoadsPage

    @GET("v1/loads/{id}")
    suspend fun loadDetails(@Path("id") id: String): ApiLoadDetails

    @POST("v13/driver/location")
    suspend fun location(@Body body:LocationBody)

    @POST("v1/loads/{id}/offer")
    suspend fun offer(@Path("id") id:String,@Body body:OfferBody):Map<String,String>

    @POST("v1/loads/{id}/accept")
    suspend fun accept(@Path("id") id:String,@Body body:ConfirmBody):Map<String,String>
}
