package com.loadfinder.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.loadfinder.app.data.repository.LoadRepository
import com.loadfinder.app.domain.model.Load
import com.loadfinder.app.domain.model.SearchSettings
import android.app.Application
import androidx.lifecycle.AndroidViewModel
import com.loadfinder.app.worker.AutoSearchScheduler
import com.loadfinder.app.worker.AutoSearchResultStore
import com.loadfinder.app.location.DeviceLocationProvider
import com.loadfinder.app.settings.SearchSettingsStore
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import androidx.paging.PagingData
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import com.loadfinder.app.data.paging.SearchContext
import dagger.hilt.android.qualifiers.ApplicationContext
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.provider.Settings
import androidx.core.content.ContextCompat
import com.loadfinder.app.location.LocationForegroundService
import com.loadfinder.app.location.LiveLocationStore

data class HomeState(
    val locationText: String = "GPS not started",
    val searching: Boolean = false,
    val loads: List<Load> = emptyList(),
    val selectedLoad: Load? = null,
    val actionMessage: String? = null,
    val actionRunning: Boolean = false,
    val resultsUpdatedAt: Long = 0L,
    val currentPage: Int = 1,
    val hasMoreResults: Boolean = false,
    val loadingMore: Boolean = false,
    val settings: SearchSettings = SearchSettings()
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val repository: LoadRepository,
    private val pagingRepository: com.loadfinder.app.data.repository.LoadPagingRepository,
    private val settingsStore: SearchSettingsStore,
    private val resultStore: AutoSearchResultStore,
    private val locationProvider: DeviceLocationProvider,
    @ApplicationContext private val applicationContext: Context,
    private val liveLocationStore: LiveLocationStore
) : ViewModel() {
    private val _state = MutableStateFlow(
        HomeState(
            settings = settingsStore.get(),
            loads = resultStore.get(),
            resultsUpdatedAt = resultStore.lastUpdatedAt()
        )
    )
    val state: StateFlow<HomeState> = _state

    private val _pagedFlow = MutableStateFlow<Flow<PagingData<Load>>>(emptyFlow())
    val pagedFlow: StateFlow<Flow<PagingData<Load>>> = _pagedFlow.asStateFlow()
    private val _searchContext = MutableStateFlow<SearchContext?>(null)
    val searchContext: StateFlow<SearchContext?> = _searchContext.asStateFlow()
    private var pagingStarted = false
    private var contextRevision = 0L
    private var lastPagingLat: Double? = null
    private var lastPagingLon: Double? = null
    private var lastPagingRefreshAt: Long = 0L

    fun startPagedSearch() {
        viewModelScope.launch {
            val location = locationProvider.current()
            if (location == null) {
                _state.value = _state.value.copy(
                    locationText = "Location unavailable. Enable location permission/GPS."
                )
                return@launch
            }
            pagingStarted = true
            contextRevision += 1L
            lastPagingLat = location.lat
            lastPagingLon = location.lon
            lastPagingRefreshAt = System.currentTimeMillis()
            _searchContext.value = SearchContext(
                lat = location.lat,
                lon = location.lon,
                settings = _state.value.settings,
                revision = contextRevision
            )
            _state.value = _state.value.copy(
                locationText = "%.5f, %.5f".format(location.lat, location.lon),
                actionMessage = null
            )
        }
    }

    fun refreshPagedSearch() {
        startPagedSearch()
    }

    init {
        viewModelScope.launch {
            _searchContext.collectLatest { context ->
                if (context == null) {
                    _pagedFlow.value = emptyFlow()
                } else {
                    _pagedFlow.value = pagingRepository.flow(context)
                }
            }
        }
        viewModelScope.launch {
            liveLocationStore.location.collect { live ->
                if (!pagingStarted || live == null || !live.isValid()) return@collect
                val oldLat = lastPagingLat
                val oldLon = lastPagingLon
                val movedKm = if (oldLat == null || oldLon == null) {
                    Double.POSITIVE_INFINITY
                } else {
                    distanceKm(oldLat, oldLon, live.lat, live.lon)
                }
                val now = System.currentTimeMillis()
                if (movedKm >= LIVE_PAGING_MOVE_THRESHOLD_KM &&
                    now - lastPagingRefreshAt >= LIVE_PAGING_REFRESH_COOLDOWN_MS) {
                    contextRevision += 1L
                    lastPagingLat = live.lat
                    lastPagingLon = live.lon
                    lastPagingRefreshAt = now
                    _searchContext.value = SearchContext(
                        lat = live.lat,
                        lon = live.lon,
                        settings = _state.value.settings,
                        revision = contextRevision
                    )
                    _state.value = _state.value.copy(
                        locationText = "%.5f, %.5f".format(live.lat, live.lon),
                        actionMessage = null
                    )
                }
            }
        }
        viewModelScope.launch {
            resultStore.revision.collect {
                _state.value = _state.value.copy(
                    loads = resultStore.get(),
                    resultsUpdatedAt = resultStore.lastUpdatedAt()
                )
            }
        }
    }

    fun startAutoSearchWithGps() {
        viewModelScope.launch {
            val location = locationProvider.current() ?: return@launch
            AutoSearchScheduler.schedule(applicationContext, location.lat, location.lon)
            startLocationTracking()
            _state.value = _state.value.copy(locationText = "%.5f, %.5f".format(location.lat, location.lon))
        }
    }

    fun hasLocationPermission(): Boolean {
        val fine = ContextCompat.checkSelfPermission(
            applicationContext, android.Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val coarse = ContextCompat.checkSelfPermission(
            applicationContext, android.Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        return fine || coarse
    }

    fun startLocationTracking(): Boolean {
        if (!hasLocationPermission()) {
            _state.value = _state.value.copy(
                actionMessage = "Location permission is required before starting live GPS."
            )
            return false
        }
        return runCatching {
            ContextCompat.startForegroundService(
                applicationContext,
                Intent(applicationContext, LocationForegroundService::class.java)
            )
            _locationTracking.value = true
            true
        }.getOrElse {
            _locationTracking.value = false
            _state.value = _state.value.copy(
                actionMessage = "Could not start live GPS: ${it.message ?: it::class.simpleName}"
            )
            false
        }
    }

    fun stopLocationTracking() {
        applicationContext.stopService(
            Intent(applicationContext, LocationForegroundService::class.java)
        )
        AutoSearchScheduler.cancel(applicationContext)
        _locationTracking.value = false
    }

    fun refreshLocationPermissionState() {
        if (!hasLocationPermission()) _locationTracking.value = false
    }

    fun openLocationSettings() {
        runCatching {
            applicationContext.startActivity(
                Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            )
        }.onFailure {
            _state.value = _state.value.copy(
                actionMessage = "Open Android Settings → Location manually."
            )
        }
    }

    fun startAutoSearch(lat: Double, lon: Double) = AutoSearchScheduler.schedule(applicationContext, lat, lon)

    fun stopAutoSearch() = AutoSearchScheduler.cancel(applicationContext)

    fun refreshSavedResults() {
        _state.value = _state.value.copy(
            loads = resultStore.get(),
            resultsUpdatedAt = resultStore.lastUpdatedAt()
        )
    }

    fun refreshSearch() {
        if (pagingStarted) refreshPagedSearch() else search()
    }
    fun openDetails(load: Load) {
        viewModelScope.launch {
            _state.value = _state.value.copy(selectedLoad = load, actionMessage = null)
            val details = repository.getDetails(load)
            if (details != null) _state.value = _state.value.copy(selectedLoad = details)
        }
    }

    fun closeDetails() {
        _state.value = _state.value.copy(selectedLoad = null, actionMessage = null, actionRunning = false)
    }

    fun submitOffer(amountEur: Double) {
        val load = _state.value.selectedLoad ?: return
        viewModelScope.launch {
            _state.value = _state.value.copy(actionRunning = true, actionMessage = null)
            val result = repository.submitOffer(load, amountEur, confirmed = true)
            _state.value = _state.value.copy(
                actionRunning = false,
                actionMessage = result.fold({ "Offer sent: $it" }, { "Offer failed: ${it.message ?: it::class.simpleName}" })
            )
        }
    }

    fun acceptLoad() {
        val load = _state.value.selectedLoad ?: return
        viewModelScope.launch {
            _state.value = _state.value.copy(actionRunning = true, actionMessage = null)
            val result = repository.acceptLoad(load, confirmed = true)
            _state.value = _state.value.copy(
                actionRunning = false,
                actionMessage = result.fold({ "Load accepted: $it" }, { "Accept failed: ${it.message ?: it::class.simpleName}" })
            )
        }
    }


    fun updateSettings(settings: SearchSettings) {
        settingsStore.save(settings)
        _state.value = _state.value.copy(settings = settings)
        val current = _searchContext.value
        if (pagingStarted && current != null) {
            contextRevision += 1L
            _searchContext.value = current.copy(
                settings = settings,
                revision = contextRevision
            )
        }
    }

    fun search() {
        viewModelScope.launch {
            _state.value = _state.value.copy(searching = true, actionMessage = null, currentPage = 1)
            val location = locationProvider.current()
            if (location == null) {
                _state.value = _state.value.copy(
                    searching = false,
                    locationText = "Location unavailable. Enable location permission/GPS."
                )
                return@launch
            }
            _state.value = _state.value.copy(locationText = "%.5f, %.5f".format(location.lat, location.lon))
            runCatching { repository.searchPage(location.lat, location.lon, _state.value.settings, 1) }
                .onSuccess { page ->
                    _state.value = _state.value.copy(
                        searching = false,
                        loads = page.items,
                        currentPage = 1,
                        hasMoreResults = page.hasMore
                    )
                }
                .onFailure { error ->
                    _state.value = _state.value.copy(
                        searching = false,
                        actionMessage = "Search failed: ${error.message ?: error::class.simpleName}"
                    )
                }
        }
    }

    fun loadMore() {
        if (_state.value.searching || _state.value.loadingMore || !_state.value.hasMoreResults) return
        viewModelScope.launch {
            val location = locationProvider.current() ?: return@launch
            val nextPage = _state.value.currentPage + 1
            _state.value = _state.value.copy(loadingMore = true, actionMessage = null)
            runCatching { repository.searchPage(location.lat, location.lon, _state.value.settings, nextPage) }
                .onSuccess { page ->
                    val merged = (_state.value.loads + page.items).distinctBy { it.id }
                        .sortedByDescending { it.matchScore }
                    _state.value = _state.value.copy(
                        loads = merged,
                        currentPage = page.page,
                        hasMoreResults = page.hasMore,
                        loadingMore = false
                    )
                }
                .onFailure { error ->
                    _state.value = _state.value.copy(
                        loadingMore = false,
                        actionMessage = "Load more failed: ${error.message ?: error::class.simpleName}"
                    )
                }
        }
    }

    private fun distanceKm(aLat: Double, aLon: Double, bLat: Double, bLon: Double): Double {
        val earth = 6371.0088
        val dLat = Math.toRadians(bLat - aLat)
        val dLon = Math.toRadians(bLon - aLon)
        val x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(Math.toRadians(aLat)) * Math.cos(Math.toRadians(bLat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        return earth * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
    }

    companion object {
        private const val LIVE_PAGING_MOVE_THRESHOLD_KM = 1.0
        private const val LIVE_PAGING_REFRESH_COOLDOWN_MS = 60_000L
    }

}
