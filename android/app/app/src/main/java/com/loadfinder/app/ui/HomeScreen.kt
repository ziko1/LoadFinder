package com.loadfinder.app.ui

import androidx.compose.foundation.layout.*
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import java.text.DateFormat
import java.util.Date
import androidx.compose.runtime.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.KeyboardType
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.paging.compose.collectAsLazyPagingItems
import androidx.paging.compose.itemKey
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.loadfinder.app.domain.model.Load

@Composable
fun HomeScreen(vm: HomeViewModel) {
    val state by vm.state.collectAsState()
    val pagedFlow by vm.pagedFlow.collectAsState()
    val pagedItems = pagedFlow.collectAsLazyPagingItems()
    val lifecycleOwner = LocalLifecycleOwner.current
    var locationPermissionGranted by remember { mutableStateOf(vm.hasLocationPermission()) }
    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { grants ->
        locationPermissionGranted =
            grants[android.Manifest.permission.ACCESS_FINE_LOCATION] == true ||
            grants[android.Manifest.permission.ACCESS_COARSE_LOCATION] == true
    }

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                locationPermissionGranted = vm.hasLocationPermission()
                vm.refreshLocationPermissionState()
                vm.refreshSavedResults()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("🚚 LoadFinder", style = MaterialTheme.typography.headlineMedium)
            Text("📍 ${state.locationText}")
            Text("Search radius: ${state.settings.radiusKm.toInt()} km")
            Spacer(Modifier.height(8.dp))
            if (!locationPermissionGranted) {
                OutlinedButton(onClick = {
                    permissionLauncher.launch(
                        arrayOf(
                            android.Manifest.permission.ACCESS_FINE_LOCATION,
                            android.Manifest.permission.ACCESS_COARSE_LOCATION
                        )
                    )
                }) { Text("Enable GPS location") }
            }
            OutlinedButton(
                onClick = { vm.startLocationTracking() },
                enabled = locationPermissionGranted
            ) { Text("Start live GPS") }
            OutlinedButton(
                onClick = { vm.openLocationSettings() }
            ) { Text("Open Android Location settings") }
            Button(
                onClick = { vm.startAutoSearchWithGps() },
                enabled = locationPermissionGranted
            ) { Text("Start Auto Search") }

            Button(
                onClick = { vm.startPagedSearch() },
                enabled = locationPermissionGranted
            ) {
                Text("Search all exchanges")
            }

            OutlinedButton(
                onClick = {
                    if (pagedItems.itemCount > 0) pagedItems.refresh()
                    else vm.refreshSearch()
                },
                enabled = !state.searching && locationPermissionGranted
            ) {
                Text("Refresh results")
            }
            if (state.resultsUpdatedAt > 0L) {
                Text(
                    "Results updated: ${
                        DateFormat.getTimeInstance(DateFormat.SHORT).format(Date(state.resultsUpdatedAt))
                    }",
                    style = MaterialTheme.typography.bodySmall
                )
            } else {
                Text("No saved Auto Search results yet", style = MaterialTheme.typography.bodySmall)
            }
            OutlinedButton(
                onClick = { vm.stopLocationTracking() },
                enabled = locationPermissionGranted
            ) { Text("Stop live GPS") }
        }

        item {
            Text("📦 Smart results: ${pagedItems.itemCount}", style = MaterialTheme.typography.titleMedium)
        }
        items(pagedItems.itemCount, key = pagedItems.itemKey { it.id }) { index ->
            pagedItems[index]?.let { load ->
                LoadCard(load, onClick = { vm.openDetails(load) })
            }
        }
        item {
            when {
                pagedItems.loadState.refresh is androidx.paging.LoadState.Loading ->
                    Text("Loading loads…")
                pagedItems.loadState.refresh is androidx.paging.LoadState.Error ->
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Search failed.")
                        TextButton(onClick = { pagedItems.retry() }) { Text("Retry") }
                    }
                pagedItems.loadState.append is androidx.paging.LoadState.Loading ->
                    Text("Loading more…")
                pagedItems.loadState.append is androidx.paging.LoadState.Error ->
                    TextButton(onClick = { pagedItems.retry() }) { Text("Retry loading more") }
            }
        }

    }


    state.selectedLoad?.let { load ->
        LoadDetailsDialog(
            load = load,
            running = state.actionRunning,
            message = state.actionMessage,
            onDismiss = { vm.closeDetails() },
            onOffer = { vm.submitOffer(it) },
            onAccept = { vm.acceptLoad() }
        )
    }
}

@Composable
private fun LoadCard(load: Load, onClick: () -> Unit) {
    Card(Modifier.fillMaxWidth(), onClick = onClick) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            Text("${load.pickupCity} → ${load.deliveryCity}", style = MaterialTheme.typography.titleMedium)
            Text("€${"%.0f".format(load.priceEur)} • ${"%.2f".format(load.pricePerKm)} €/km")
            Text("${load.pickupDistanceKm.toInt()} km pickup • ${load.emptyDistanceKm.toInt()} km empty")
            Text("⭐ Match ${load.matchScore}%")
            Text("${load.exchange} • ${load.vehicleType} • ${load.weightKg} kg")
        }
    }
}


@Composable
private fun LoadDetailsDialog(
    load: Load,
    running: Boolean,
    message: String?,
    onDismiss: () -> Unit,
    onOffer: (Double) -> Unit,
    onAccept: () -> Unit
) {
    var amount by remember(load.id) { mutableStateOf("%.2f".format(load.priceEur)) }
    var confirmOffer by remember(load.id) { mutableStateOf(false) }
    var confirmAccept by remember(load.id) { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = { if (!running) onDismiss() },
        title = { Text("${load.pickupCity} → ${load.deliveryCity}") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Exchange: ${load.exchange}")
                Text("Price: €${"%.2f".format(load.priceEur)} • ${"%.2f".format(load.pricePerKm)} €/km")
                Text("Distance: ${"%.0f".format(load.distanceKm)} km")
                Text("Pickup: ${"%.0f".format(load.pickupDistanceKm)} km")
                Text("Empty: ${"%.0f".format(load.emptyDistanceKm)} km")
                Text("Weight: ${load.weightKg} kg • Vehicle: ${load.vehicleType}")
                Text("Match Score: ${load.matchScore}%")
                OutlinedTextField(
                    value = amount,
                    onValueChange = { amount = it },
                    enabled = !running,
                    label = { Text("Offer (€)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    singleLine = true
                )
                message?.let { Text(it) }
            }
        },
        confirmButton = {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    enabled = !running,
                    onClick = { confirmOffer = true }
                ) { Text("Offer") }
                Button(
                    enabled = !running,
                    onClick = { confirmAccept = true }
                ) { Text("Accept") }
            }
        },
        dismissButton = {
            TextButton(enabled = !running, onClick = onDismiss) { Text("Close") }
        }
    )

    if (confirmOffer) {
        AlertDialog(
            onDismissRequest = { confirmOffer = false },
            title = { Text("Confirm offer") },
            text = { Text("Send an offer of €$amount for this load to Trans.eu? This is a contractual action.") },
            confirmButton = {
                TextButton(onClick = {
                    confirmOffer = false
                    amount.toDoubleOrNull()?.takeIf { it > 0 }?.let(onOffer)
                }) { Text("Confirm offer") }
            },
            dismissButton = { TextButton(onClick = { confirmOffer = false }) { Text("Cancel") } }
        )
    }

    if (confirmAccept) {
        AlertDialog(
            onDismissRequest = { confirmAccept = false },
            title = { Text("Confirm acceptance") },
            text = { Text("Accept this load on Trans.eu? This is a contractual action.") },
            confirmButton = {
                TextButton(onClick = {
                    confirmAccept = false
                    onAccept()
                }) { Text("Accept load") }
            },
            dismissButton = { TextButton(onClick = { confirmAccept = false }) { Text("Cancel") } }
        )
    }
}
