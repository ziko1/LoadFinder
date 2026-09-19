package com.loadfinder.app.data.exchange

import com.loadfinder.app.domain.model.Load
import com.loadfinder.app.domain.model.SearchSettings

data class ExchangePage(
    val items: List<Load>,
    val page: Int,
    val pageSize: Int,
    val total: Int,
    val hasMore: Boolean
)

interface ExchangeAdapter {
    val name: String
    suspend fun searchLoads(lat: Double, lon: Double): List<Load>
    suspend fun searchLoadsPage(lat: Double, lon: Double, settings: SearchSettings, page: Int, pageSize: Int): ExchangePage? = null
    suspend fun getLoadDetails(loadId: String): Load?
    suspend fun submitOffer(loadId: String, amountEur: Double, confirmed: Boolean = false): Result<String>
    suspend fun acceptLoad(loadId: String, confirmed: Boolean = false): Result<String>
}
