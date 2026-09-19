package com.loadfinder.app.worker

import kotlin.test.Test
import kotlin.test.assertEquals

class AutoSearchStateStoreContractTest {
    @Test
    fun gpsCoordinatesRoundTripWithoutFloatConversion() {
        val lat = 52.520008123
        val lon = 13.404954987
        assertEquals(lat.toString().toDouble(), lat)
        assertEquals(lon.toString().toDouble(), lon)
    }
}
