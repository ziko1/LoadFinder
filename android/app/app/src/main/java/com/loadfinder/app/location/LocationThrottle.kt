package com.loadfinder.app.location
import android.location.Location

class LocationThrottle(
 private val minDistanceMeters:Float=500f,
 private val minIntervalMs:Long=30_000L
){
 private var last:Location?=null
 private var lastSent=0L
 fun shouldSend(now:Long,location:Location):Boolean{
  val distance=last?.distanceTo(location) ?: Float.MAX_VALUE
  if(distance>=minDistanceMeters || now-lastSent>=minIntervalMs){
   last=Location(location);lastSent=now;return true
  }
  return false
 }
}
