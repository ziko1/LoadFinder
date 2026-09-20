package com.loadfinder.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun DriverRouteScreen(
    routeName: String,
    pickup: String,
    delivery: String,
    status: String,
    eta: String,
    onNextLoad: () -> Unit
) {
    Column(
        Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("🚚 ACTIVE ROUTE", style = MaterialTheme.typography.headlineMedium)
        Text(routeName, style = MaterialTheme.typography.titleLarge)
        Text("📍 Pickup: $pickup")
        Text("🏁 Delivery: $delivery")
        Text("STATUS: $status")
        Text("ETA: $eta")

        Spacer(Modifier.height(8.dp))

        Button(
            onClick = onNextLoad,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("🔎 ЗНАЙТИ НАСТУПНИЙ ВАНТАЖ")
        }
    }
}
