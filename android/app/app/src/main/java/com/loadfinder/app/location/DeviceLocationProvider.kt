package com.loadfinder.app.location

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import dagger.hilt.android.qualifiers.ApplicationContext
import com.google.android.gms.location.CurrentLocationRequest
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import javax.inject.Inject

data class DeviceLocation(val lat: Double, val lon: Double)

class DeviceLocationProvider @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val client: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(context)

    suspend fun current(): DeviceLocation? {
        val fine = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION)
        val coarse = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION)
        if (fine != PackageManager.PERMISSION_GRANTED && coarse != PackageManager.PERMISSION_GRANTED) return null

        val request = CurrentLocationRequest.Builder()
            .setPriority(
                if (fine == PackageManager.PERMISSION_GRANTED) Priority.PRIORITY_HIGH_ACCURACY
                else Priority.PRIORITY_BALANCED_POWER_ACCURACY
            )
            .build()

        return suspendCancellableCoroutine { cont ->
            client.getCurrentLocation(request, null)
                .addOnSuccessListener { location ->
                    if (cont.isActive) {
                        cont.resume(location?.let { DeviceLocation(it.latitude, it.longitude) })
                    }
                }
                .addOnFailureListener {
                    if (cont.isActive) cont.resume(null)
                }
        }
    }
}
