package com.loadfinder.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun LoadActionDialog(
    title: String,
    currentPrice: Double?,
    onDismiss: () -> Unit,
    onBid: (Double) -> Unit,
    onAccept: () -> Unit
) {
    var price by remember(currentPrice) {
        mutableStateOf(currentPrice?.toString() ?: "")
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Дія виконується через офіційний API біржі.")
                OutlinedTextField(
                    value = price,
                    onValueChange = { price = it },
                    label = { Text("Ставка EUR") },
                    singleLine = true
                )
                Text(
                    "ACCEPT також вимагає актуальну version пропозиції. " +
                    "Перед фінансовою дією потрібне підтвердження."
                )
            }
        },
        confirmButton = {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = {
                        price.toDoubleOrNull()?.let(onBid)
                    }
                ) { Text("BID") }

                Button(onClick = onAccept) {
                    Text("ACCEPT")
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Скасувати") }
        }
    )
}
