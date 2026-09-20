package com.loadfinder.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.loadfinder.app.domain.model.Load

@Composable
fun AutoSearchScreen(
    lat:Double,
    lon:Double,
    loads:List<Load>,
    autoSearch:Boolean,
    onToggle:()->Unit,
    onLoad:(Load)->Unit
) {
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.SpaceBetween) {
            Column {
                Text("🚚 LoadFinder",style=MaterialTheme.typography.headlineSmall)
                Text("📍 ${"%.5f".format(lat)}, ${"%.5f".format(lon)}")
            }
            Switch(checked=autoSearch,onCheckedChange={onToggle()})
        }
        Text(if(autoSearch)"🟢 AUTO SEARCH ON" else "⚪ AUTO SEARCH OFF")
        Spacer(Modifier.height(10.dp))
        MapScreen(lat,lon,loads)
        Spacer(Modifier.height(10.dp))
        Text("🔥 Best matches",style=MaterialTheme.typography.titleLarge)
        LazyColumn(verticalArrangement=Arrangement.spacedBy(8.dp)) {
            items(loads.take(10)) { load ->
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(14.dp)) {
                        Text("${load.pickupCity} → ${load.deliveryCity}",style=MaterialTheme.typography.titleMedium)
                        Text("⭐ ${load.matchScore}%  •  €${"%.0f".format(load.priceEur)}  •  ${"%.2f".format(load.pricePerKm)} €/km")
                        Text("Pickup ${load.pickupDistanceKm.toInt()} km • Empty ${load.emptyDistanceKm.toInt()} km")
                        Button(onClick={onLoad(load)}) { Text("DETAILS") }
                    }
                }
            }
        }
    }
}
