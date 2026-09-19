package com.loadfinder.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.dp
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.*

data class RoutePoint(val lat: Double, val lon: Double, val title: String)

@Composable
fun RealtimeMapScreen(
    vehicle: RoutePoint?,
    pickup: RoutePoint?,
    delivery: RoutePoint?,
    radiusKm: Float = 100f,
    onNextLoad: () -> Unit
) {
    val center = vehicle?.let { LatLng(it.lat, it.lon) } ?: LatLng(52.52, 13.405)
    val camera = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(center, 9f)
    }

    LaunchedEffect(vehicle?.lat, vehicle?.lon) {
        vehicle?.let {
            camera.animate(CameraUpdateFactory.newLatLngZoom(LatLng(it.lat, it.lon), 10f))
        }
    }

    Box(Modifier.fillMaxSize()) {
        GoogleMap(
            modifier = Modifier.fillMaxSize(),
            cameraPositionState = camera,
            uiSettings = MapUiSettings(
                zoomControlsEnabled = false,
                myLocationButtonEnabled = false
            )
        ) {
            vehicle?.let {
                Marker(
                    state = MarkerState(LatLng(it.lat, it.lon)),
                    title = it.title,
                    snippet = "Ваш автомобіль"
                )
            }
            pickup?.let {
                Marker(
                    state = MarkerState(LatLng(it.lat, it.lon)),
                    title = it.title,
                    snippet = "Pickup"
                )
            }
            delivery?.let {
                Marker(
                    state = MarkerState(LatLng(it.lat, it.lon)),
                    title = it.title,
                    snippet = "Delivery"
                )
            }
            vehicle?.let {
                Circle(
                    center = LatLng(it.lat, it.lon),
                    radius = radiusKm * 1000.0,
                    strokeWidth = 2f
                )
            }
            if (pickup != null && delivery != null) {
                Polyline(
                    points = listOf(
                        LatLng(pickup.lat, pickup.lon),
                        LatLng(delivery.lat, delivery.lon)
                    ),
                    width = 8f
                )
            }
        }

        Card(
            Modifier.align(Alignment.BottomCenter).padding(12.dp).fillMaxWidth()
        ) {
            Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                Column(Modifier.weight(1f)) {
                    Text("🔎 Пошук у радіусі ${radiusKm.toInt()} км")
                    Text("GPS оновлюється автоматично")
                }
                Button(onClick = onNextLoad) { Text("NEXT") }
            }
        }
    }
}
