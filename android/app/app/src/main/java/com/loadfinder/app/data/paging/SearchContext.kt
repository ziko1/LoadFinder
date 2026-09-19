package com.loadfinder.app.data.paging

import com.loadfinder.app.domain.model.SearchSettings

data class SearchContext(
    val lat: Double,
    val lon: Double,
    val settings: SearchSettings,
    val revision: Long
) {
    fun isValid(): Boolean =
        lat.isFinite() && lon.isFinite() &&
            lat in -90.0..90.0 && lon in -180.0..180.0
}
