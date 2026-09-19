package com.loadfinder.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ConnectionScreen(onConnectTransEu: () -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Transport exchanges", style = MaterialTheme.typography.headlineSmall)
        Text("Connect accounts using official OAuth/API permissions.")
        Button(onClick = onConnectTransEu) { Text("Connect Trans.eu") }
        OutlinedButton(onClick = {}) { Text("TIMOCOM — API access required") }
        OutlinedButton(onClick = {}) { Text("Transporeon — carrier program/API required") }
    }
}
