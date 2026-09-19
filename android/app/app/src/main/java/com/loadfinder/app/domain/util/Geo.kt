package com.loadfinder.app.domain.util

import com.loadfinder.app.domain.model.GeoPoint
import kotlin.math.*

object Geo {
    fun distanceKm(a: GeoPoint, b: GeoPoint): Double {
        val r = 6371.0
        val dLat = Math.toRadians(b.lat - a.lat)
        val dLon = Math.toRadians(b.lon - a.lon)
        val x = sin(dLat / 2).pow(2) +
                cos(Math.toRadians(a.lat)) *
                cos(Math.toRadians(b.lat)) *
                sin(dLon / 2).pow(2)
        return 2 * r * atan2(sqrt(x), sqrt(1 - x))
    }
}
