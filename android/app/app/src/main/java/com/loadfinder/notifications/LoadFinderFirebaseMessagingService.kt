package com.loadfinder.notifications

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.loadfinder.app.domain.model.GeoPoint
import com.loadfinder.app.domain.model.Load
import com.loadfinder.app.notifications.LoadNotificationHelper

class LoadFinderFirebaseMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        // Send the token only after an authenticated driver session exists.
    }

    override fun onMessageReceived(message: RemoteMessage) {
        val data = message.data
        val id = data["id"] ?: return
        val pickup = data["pickup"] ?: return
        val delivery = data["delivery"] ?: return
        val price = data["priceEur"]?.toDoubleOrNull() ?: return
        val load = Load(
            id = id,
            exchange = data["exchange"] ?: "BACKEND",
            pickupCity = pickup,
            pickup = GeoPoint(0.0, 0.0),
            deliveryCity = delivery,
            delivery = GeoPoint(0.0, 0.0),
            weightKg = data["weightKg"]?.toIntOrNull() ?: 0,
            volumeM3 = data["volumeM3"]?.toDoubleOrNull() ?: 0.0,
            vehicleType = data["vehicleType"] ?: "",
            priceEur = price,
            distanceKm = data["distanceKm"]?.toDoubleOrNull() ?: 0.0,
            pickupDistanceKm = data["pickupDistanceKm"]?.toDoubleOrNull() ?: 0.0,
            emptyDistanceKm = data["emptyDistanceKm"]?.toDoubleOrNull() ?: 0.0,
            pricePerKm = data["pricePerKm"]?.toDoubleOrNull() ?: 0.0,
            matchScore = data["matchScore"]?.toIntOrNull() ?: 0
        )
        LoadNotificationHelper.notifyNewMatches(this, listOf(load))
    }
}
