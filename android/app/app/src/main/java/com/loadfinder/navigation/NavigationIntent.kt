package com.loadfinder.navigation
import android.content.Context
import android.content.Intent
import android.net.Uri
fun openNavigation(context:Context,lat:Double,lon:Double){
 context.startActivity(Intent(Intent.ACTION_VIEW,Uri.parse("google.navigation:q=$lat,$lon&mode=d")).apply{setPackage("com.google.android.apps.maps")})
}
