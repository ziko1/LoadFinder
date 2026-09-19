package com.loadfinder.app.location

import com.loadfinder.app.data.paging.SearchContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

data class LiveLocation(
    val lat: Double,
    val lon: Double,
    val accuracyMeters: Float,
    val timestampMillis: Long
) {
    fun isValid(): Boolean =
        lat.isFinite() && lon.isFinite() &&
            lat in -90.0..90.0 && lon in -180.0..180.0
}

@Singleton
class LiveLocationStore @Inject constructor() {
    private val _location = MutableStateFlow<LiveLocation?>(null)
    val location: StateFlow<LiveLocation?> = _location.asStateFlow()

    fun publish(value: LiveLocation) {
        if (value.isValid()) _location.value = value
    }

    fun clear() {
        _location.value = null
    }
}
