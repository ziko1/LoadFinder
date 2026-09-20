package com.loadfinder.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.CameraPosition
import com.google.maps.android.compose.*

data class DriverGps(val lat:Double,val lon:Double,val speedKmh:Double)
data class ActiveLoadUi(
 val title:String,val pickup:String,val delivery:String,
 val etaMinutes:Int,val distanceKm:Double,val priceEur:Double,
 val profitEur:Double,val status:String
)

@Composable
fun DriverNavigatorScreen(
 gps:DriverGps?,load:ActiveLoadUi?,nextLoadCount:Int,
 onNextLoad:()->Unit,onPickup:()->Unit,onDelivery:()->Unit
){
 val center=gps?.let{LatLng(it.lat,it.lon)}?:LatLng(52.52,13.405)
 val camera=rememberCameraPositionState{
  position=CameraPosition.fromLatLngZoom(center,13f)
 }
 LaunchedEffect(gps?.lat,gps?.lon){
  gps?.let{
   camera.animate(CameraUpdateFactory.newLatLng(LatLng(it.lat,it.lon)))
  }
 }
 Box(Modifier.fillMaxSize()){
  GoogleMap(
   modifier=Modifier.fillMaxSize(),
   cameraPositionState=camera,
   uiSettings=MapUiSettings(
    zoomControlsEnabled=false,
    compassEnabled=true,
    myLocationButtonEnabled=false
   )
  ){
   gps?.let{
    Marker(
     state=MarkerState(LatLng(it.lat,it.lon)),
     title="Ваш автомобіль",
     snippet="${it.speedKmh.toInt()} км/год"
    )
   }
  }

  Surface(
   modifier=Modifier.align(Alignment.TopCenter).padding(12.dp).fillMaxWidth(),
   shape=RoundedCornerShape(16.dp),tonalElevation=5.dp
  ){
   Row(Modifier.padding(14.dp)){
    Column(Modifier.weight(1f)){
     Text("🚚 ${load?.status?:"Очікування"}")
     Text(if(load!=null)
      "${load.distanceKm.toInt()} км • ETA ${load.etaMinutes} хв"
      else "Немає активного маршруту")
    }
    Text("${gps?.speedKmh?.toInt()?:0} км/год")
   }
  }

  Surface(
   modifier=Modifier.align(Alignment.BottomCenter).fillMaxWidth(),
   shape=RoundedCornerShape(topStart=24.dp,topEnd=24.dp),
   tonalElevation=9.dp
  ){
   Column(Modifier.padding(18.dp),verticalArrangement=Arrangement.spacedBy(9.dp)){
    load?.let{
     Text(it.title,style=MaterialTheme.typography.titleLarge)
     Text("📍 ${it.pickup} → 🏁 ${it.delivery}")
     Row(horizontalArrangement=Arrangement.spacedBy(18.dp)){
      Text("€${"%.0f".format(it.priceEur)}")
      Text("Прибуток €${"%.0f".format(it.profitEur)}")
      Text("ETA ${it.etaMinutes} хв")
     }
     Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(8.dp)){
      OutlinedButton(onClick=onPickup,Modifier.weight(1f)){Text("PICKUP")}
      OutlinedButton(onClick=onDelivery,Modifier.weight(1f)){Text("DELIVERY")}
     }
    }
    Button(onClick=onNextLoad,Modifier.fillMaxWidth()){
     Text("🔎 NEXT LOAD ${if(nextLoadCount>0)"($nextLoadCount)" else ""}")
    }
   }
  }
 }
}
