package com.loadfinder.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ProfitCard(
    priceEur: Double,
    totalKm: Double,
    emptyKm: Double,
    profitEur: Double,
    eurPerKm: Double,
    onOpen: () -> Unit
) {
    Card(Modifier.fillMaxWidth()) {
        Column(
            Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text("€%.0f".format(priceEur), style = MaterialTheme.typography.headlineSmall)
            Text("Загалом: %.0f км • порожній: %.0f км".format(totalKm, emptyKm))
            Text("€%.2f / км".format(eurPerKm))
            Text("Орієнтовний прибуток: €%.0f".format(profitEur))
            Button(onClick = onOpen) { Text("ВІДКРИТИ") }
        }
    }
}
