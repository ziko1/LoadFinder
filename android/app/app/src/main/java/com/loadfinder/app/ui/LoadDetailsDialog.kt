package com.loadfinder.app.ui

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import com.loadfinder.app.domain.model.Load

@Composable
fun LoadDetailsDialog(
    load:Load,
    onDismiss:()->Unit,
    onBid:()->Unit,
    onAccept:()->Unit
) {
    AlertDialog(
        onDismissRequest=onDismiss,
        title={ Text("${load.pickupCity} → ${load.deliveryCity}") },
        text={
            Text(
                "€${"%.0f".format(load.priceEur)}\n" +
                "${"%.2f".format(load.pricePerKm)} €/km\n" +
                "Pickup: ${load.pickupDistanceKm.toInt()} km\n" +
                "Empty: ${load.emptyDistanceKm.toInt()} km\n" +
                "Match: ${load.matchScore}%\n" +
                "Exchange: ${load.exchange}"
            )
        },
        confirmButton={ Button(onClick=onBid){Text("BID")} },
        dismissButton={ OutlinedButton(onClick=onAccept){Text("ACCEPT")} }
    )
}
