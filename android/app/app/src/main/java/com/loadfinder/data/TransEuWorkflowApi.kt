package com.loadfinder.data

import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.Body

data class ProposalDto(
    val id: String,
    val offerId: String?,
    val price: PriceDto?,
    val stage: String?,
    val status: String?,
    val version: Int,
    val is_first_buy: Boolean = false,
    val decision_date: String? = null
)
data class PriceDto(val value: Double, val currency: String)

data class NegotiateRequest(
    val driverId: String,
    val amountEur: Double,
    val confirmed: Boolean
)
data class AcceptRequest(
    val driverId: String,
    val confirmed: Boolean
)

interface TransEuWorkflowApi {
    @GET("/v1/exchanges/trans-eu/proposals/{freightId}")
    suspend fun proposal(
        @Path("freightId") freightId: String,
        @Query("driverId") driverId: String
    ): ProposalDto

    @POST("/v1/exchanges/trans-eu/proposals/{freightId}/negotiate")
    suspend fun negotiate(
        @Path("freightId") freightId: String,
        @Body body: NegotiateRequest
    ): Any

    @POST("/v1/exchanges/trans-eu/proposals/{freightId}/accept")
    suspend fun accept(
        @Path("freightId") freightId: String,
        @Body body: AcceptRequest
    ): Any

    @GET("/v1/exchanges/trans-eu/accepted")
    suspend fun accepted(@Query("driverId") driverId: String): Any
}
