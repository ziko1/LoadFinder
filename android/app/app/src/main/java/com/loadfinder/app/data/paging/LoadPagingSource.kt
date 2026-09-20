package com.loadfinder.app.data.paging

import androidx.paging.PagingSource
import androidx.paging.PagingState
import com.loadfinder.app.data.api.BackendApi
import com.loadfinder.app.data.exchange.BackendExchangeAdapter
import com.loadfinder.app.domain.model.SearchSettings
import com.loadfinder.app.domain.model.Load
import kotlinx.coroutines.CancellationException

class LoadPagingSource(
    private val api: BackendApi,
    private val location: Pair<Double, Double>,
    private val settings: SearchSettings,
    private val pageSize: Int = 25
) : PagingSource<Int, Load>() {

    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Load> {
        val page = params.key ?: 1
        return try {
            val response = api.loadPage(
                lat = location.first,
                lon = location.second,
                radiusKm = settings.radiusKm,
                minPricePerKm = settings.minPricePerKm,
                maxEmptyKm = settings.maxEmptyKm,
                minMatchScore = settings.minMatchScore,
                vehicleType = settings.vehicleType,
                page = page,
                pageSize = pageSize.coerceIn(1, 50),
                minPriceEur = settings.minPriceEur,
                destination = settings.destination
            )
            val items = response.items.map { x ->
                Load(
                    id = x.id, exchange = x.exchange,
                    pickupCity = x.pickupCity, pickup = com.loadfinder.app.domain.model.GeoPoint(x.pickupLat,x.pickupLon),
                    deliveryCity = x.deliveryCity, delivery = com.loadfinder.app.domain.model.GeoPoint(x.deliveryLat,x.deliveryLon),
                    weightKg = x.weightKg, volumeM3 = x.volumeM3, vehicleType = x.vehicleType,
                    priceEur = x.priceEur, distanceKm = x.distanceKm, pickupDistanceKm = x.pickupDistanceKm,
                    emptyDistanceKm = x.emptyDistanceKm, pricePerKm = x.pricePerKm,
                    matchScore = x.matchScore, status = x.status
                )
            }
            LoadResult.Page(
                data = items,
                prevKey = if (page == 1) null else page - 1,
                nextKey = if (response.hasMore && items.isNotEmpty()) page + 1 else null
            )
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            LoadResult.Error(e)
        }
    }

    override fun getRefreshKey(state: PagingState<Int, Load>): Int? =
        state.anchorPosition?.let { position ->
            state.closestPageToPosition(position)?.let { page ->
                page.prevKey?.plus(1) ?: page.nextKey?.minus(1)
            }
        }
}
