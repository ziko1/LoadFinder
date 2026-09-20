package com.loadfinder.app.data.repository

import com.loadfinder.app.data.exchange.ExchangeAdapter
import com.loadfinder.app.data.exchange.ExchangePage
import com.loadfinder.app.domain.model.Load
import com.loadfinder.app.domain.model.SearchSettings
import com.loadfinder.app.domain.usecase.MatchScoreCalculator
import kotlinx.coroutines.CancellationException
import javax.inject.Inject

class LoadRepository @Inject constructor(
    private val exchanges: Set<@JvmSuppressWildcards ExchangeAdapter>,
    private val score: MatchScoreCalculator
) {
    suspend fun getDetailsById(id: String): Load? =
        exchanges.firstOrNull { it.name.equals("BACKEND", ignoreCase = true) }?.getLoadDetails(id)
    suspend fun getDetails(load: Load): Load? {
        val exchange = exchanges.firstOrNull { it.name.equals("BACKEND", ignoreCase = true) }
            ?: exchanges.firstOrNull { it.name.equals(load.exchange, ignoreCase = true) } ?: return load
        return try {
            exchange.getLoadDetails(load.id) ?: load
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            null
        }
    }

    suspend fun submitOffer(load: Load, amountEur: Double, confirmed: Boolean): Result<String> {
        val exchange = exchanges.firstOrNull { it.name.equals("BACKEND", ignoreCase = true) } ?: return Result.failure(IllegalStateException("BACKEND_EXCHANGE_UNAVAILABLE"))
        return try {
            exchange.submitOffer(load.id, amountEur, confirmed)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun acceptLoad(load: Load, confirmed: Boolean): Result<String> {
        val exchange = exchanges.firstOrNull { it.name.equals("BACKEND", ignoreCase = true) } ?: return Result.failure(IllegalStateException("BACKEND_EXCHANGE_UNAVAILABLE"))
        return try {
            exchange.acceptLoad(load.id, confirmed)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun searchPage(lat: Double, lon: Double, settings: SearchSettings, page: Int, pageSize: Int = 25): ExchangePage {
        val backend = exchanges.firstOrNull { it.name.equals("BACKEND", ignoreCase = true) }
            ?: return ExchangePage(emptyList(), page, pageSize, 0, false)
        val raw = backend.searchLoadsPage(lat, lon, settings, page, pageSize)
            ?: return ExchangePage(emptyList(), page, pageSize, 0, false)
        val filtered = raw.items
            .map { it.copy(matchScore = score.calculate(it, settings)) }
            .filter {
                it.pickupDistanceKm <= settings.radiusKm &&
                it.priceEur >= settings.minPriceEur &&
                it.pricePerKm >= settings.minPricePerKm &&
                it.emptyDistanceKm <= settings.maxEmptyKm &&
                it.matchScore >= settings.minMatchScore &&
                (it.vehicleType.equals(settings.vehicleType, ignoreCase = true) || it.vehicleType.equals("UNKNOWN", ignoreCase = true)) &&
                destinationMatches(it.deliveryCity, settings.destination)
            }
            .distinctBy { it.id }
            .sortedByDescending { it.matchScore }
        return raw.copy(items = filtered, hasMore = raw.hasMore)
    }

    suspend fun search(lat: Double, lon: Double, settings: SearchSettings): List<Load> {
        val backend = exchanges.firstOrNull { it.name.equals("BACKEND", ignoreCase = true) }
        if (backend != null) {
            val results = mutableListOf<Load>()
            for (page in 1..20) {
                val response = backend.searchLoadsPage(lat, lon, settings, page, 50) ?: break
                results.addAll(response.items)
                if (!response.hasMore) break
            }
            return results.distinctBy { it.id }
        }
        val results = exchanges.flatMap { exchange ->
            try {
                exchange.searchLoads(lat, lon)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                throw e
            }
        }
        return results
            .map { it.copy(matchScore = score.calculate(it, settings)) }
            .filter {
                it.pickupDistanceKm <= settings.radiusKm &&
                it.priceEur >= settings.minPriceEur &&
                it.pricePerKm >= settings.minPricePerKm &&
                it.emptyDistanceKm <= settings.maxEmptyKm &&
                it.matchScore >= settings.minMatchScore &&
                (it.vehicleType.equals(settings.vehicleType, ignoreCase = true) || it.vehicleType.equals("UNKNOWN", ignoreCase = true)) &&
                destinationMatches(it.deliveryCity, settings.destination)
            }
            .distinctBy { it.id }
            .sortedByDescending { it.matchScore }
    }

    private fun destinationMatches(deliveryCity: String, destination: String?): Boolean {
        val requested = destination?.trim().orEmpty()
        if (requested.isEmpty()) return true
        return deliveryCity.contains(requested, ignoreCase = true)
    }
}
