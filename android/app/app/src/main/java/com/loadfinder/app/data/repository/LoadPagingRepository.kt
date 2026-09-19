package com.loadfinder.app.data.repository

import androidx.paging.Pager
import androidx.paging.PagingConfig
import androidx.paging.PagingData
import com.loadfinder.app.data.api.BackendApi
import com.loadfinder.app.data.paging.LoadPagingSource
import com.loadfinder.app.domain.model.Load
import com.loadfinder.app.domain.model.SearchSettings
import com.loadfinder.app.data.paging.SearchContext
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LoadPagingRepository @Inject constructor(
    private val api: BackendApi
) {
    fun flow(
        lat: Double,
        lon: Double,
        settings: SearchSettings,
        pageSize: Int = 25
    ): Flow<PagingData<Load>> = flow(
        SearchContext(lat, lon, settings, revision = 0L),
        pageSize
    )

    fun flow(
        context: SearchContext,
        pageSize: Int = 25
    ): Flow<PagingData<Load>> {
        require(context.isValid()) { "Invalid search context" }
        return Pager(
            config = PagingConfig(
                pageSize = pageSize.coerceIn(1, 50),
                initialLoadSize = pageSize.coerceIn(1, 50),
                enablePlaceholders = false
            ),
            pagingSourceFactory = {
                LoadPagingSource(api, context.lat to context.lon, context.settings, pageSize)
            }
        ).flow
    }
}
