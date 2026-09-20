package com.loadfinder.app.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.loadfinder.app.domain.model.Load

/**
 * Dependency-free map surface for the MVP.
 * Replace with Google Maps/MapLibre in production.
 */
@Composable
fun MapScreen(
    lat:Double,
    lon:Double,
    loads:List<Load>,
    modifier:Modifier=Modifier
) {
    Card(modifier.fillMaxWidth().height(260.dp)) {
        Column(Modifier.padding(12.dp)) {
            Text("Live map",style=MaterialTheme.typography.titleMedium)
            Text("📍 ${"%.5f".format(lat)}, ${"%.5f".format(lon)}")
            Text("⭕ Search radius: 100 km")
            Text("📦 ${loads.size} matching loads")
            Canvas(Modifier.fillMaxSize().padding(12.dp)) {
                drawCircle(
                    color=Color(0xFF4CAF50),
                    radius=size.minDimension*0.42f,
                    center=Offset(size.width/2,size.height/2)
                )
                drawCircle(
                    color=Color(0xFF1565C0),
                    radius=10f,
                    center=Offset(size.width/2,size.height/2)
                )
            }
        }
    }
}
