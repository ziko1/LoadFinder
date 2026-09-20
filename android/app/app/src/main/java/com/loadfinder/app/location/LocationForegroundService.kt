package com.loadfinder.app.location

import android.Manifest
import android.app.*
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.os.IBinder
import androidx.core.app.ActivityCompat
import androidx.core.app.ServiceCompat
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*
import com.loadfinder.app.worker.AutoSearchScheduler
import javax.inject.Inject
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class LocationForegroundService : Service() {
    @Inject lateinit var liveLocationStore: LiveLocationStore
    private lateinit var client: FusedLocationProviderClient

    override fun onCreate() {
        super.onCreate()
        client = LocationServices.getFusedLocationProviderClient(this)

        val hasFine = ActivityCompat.checkSelfPermission(
            this, Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val hasCoarse = ActivityCompat.checkSelfPermission(
            this, Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        if (!hasFine && !hasCoarse) {
            stopSelf()
            return
        }

        val channel = NotificationChannel(
            "location", "Location tracking", NotificationManager.IMPORTANCE_LOW
        )
        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)

        val notification = NotificationCompat.Builder(this, "location")
            .setContentTitle("LoadFinder")
            .setContentText("GPS + automatic load search active")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .build()

        ServiceCompat.startForeground(
            this,
            10,
            notification,
            ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
        )

        val request = LocationRequest.Builder(
            if (hasFine) Priority.PRIORITY_HIGH_ACCURACY
            else Priority.PRIORITY_BALANCED_POWER_ACCURACY,
            20_000
        ).setMinUpdateIntervalMillis(10_000).build()

        client.requestLocationUpdates(request, callback, mainLooper)
    }

    private val callback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            result.lastLocation?.let { location ->
                val lat = location.latitude
                val lon = location.longitude
                if (lat.isFinite() && lon.isFinite() &&
                    lat in -90.0..90.0 && lon in -180.0..180.0) {
                    liveLocationStore.publish(
                        LiveLocation(
                            lat = lat,
                            lon = lon,
                            accuracyMeters = location.accuracy,
                            timestampMillis = location.time
                        )
                    )
                    AutoSearchScheduler.updateLocation(
                        this@LocationForegroundService,
                        lat,
                        lon
                    )
                }
            }
        }
    }

    override fun onDestroy() {
        if (::client.isInitialized) client.removeLocationUpdates(callback)
        liveLocationStore.clear()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
