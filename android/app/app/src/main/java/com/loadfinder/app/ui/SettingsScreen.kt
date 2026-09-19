package com.loadfinder.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun SettingsScreen() {
    var radius by remember { mutableStateOf(100f) }
    var minKm by remember { mutableStateOf(1.20f) }
    var maxEmpty by remember { mutableStateOf(50f) }
    var autoSearch by remember { mutableStateOf(true) }
    var autoBid by remember { mutableStateOf(false) }
    var autoAccept by remember { mutableStateOf(false) }

    Column(Modifier.fillMaxSize().padding(20.dp), verticalArrangement=Arrangement.spacedBy(12.dp)) {
        Text("Search settings", style=MaterialTheme.typography.headlineSmall)
        Text("Radius: ${radius.toInt()} km")
        Slider(value=radius,onValueChange={radius=it},valueRange=10f..200f)
        Text("Minimum €/km: ${"%.2f".format(minKm)}")
        Slider(value=minKm,onValueChange={minKm=it},valueRange=0.5f..3f)
        Text("Maximum empty distance: ${maxEmpty.toInt()} km")
        Slider(value=maxEmpty,onValueChange={maxEmpty=it},valueRange=10f..200f)

        Row(horizontalArrangement=Arrangement.SpaceBetween, modifier=Modifier.fillMaxWidth()) {
            Text("Auto Search"); Switch(checked=autoSearch,onCheckedChange={autoSearch=it})
        }
        Row(horizontalArrangement=Arrangement.SpaceBetween, modifier=Modifier.fillMaxWidth()) {
            Text("Auto Bid"); Switch(checked=autoBid,onCheckedChange={autoBid=it})
        }
        Row(horizontalArrangement=Arrangement.SpaceBetween, modifier=Modifier.fillMaxWidth()) {
            Text("Auto Accept"); Switch(checked=autoAccept,onCheckedChange={autoAccept=it})
        }

        if (autoAccept) {
            Text("⚠ Auto Accept is contractual. Add explicit limits and provider permissions before enabling.",
                color=MaterialTheme.colorScheme.error)
        }
    }
}
