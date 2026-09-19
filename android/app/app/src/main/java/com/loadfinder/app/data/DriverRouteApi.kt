package com.loadfinder.app.data
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
data class RoutePointDto(val lat:Double,val lon:Double)
data class DriverRouteDto(val driverId:String,val loadId:String,val pickup:RoutePointDto,val delivery:RoutePointDto,val status:String)
data class PositionDto(val driverId:String,val lat:Double,val lon:Double,val speedKmh:Double?=null,val recordedAt:String)
interface DriverRouteApi{
 @POST("/v1/driver/route/position") suspend fun position(@Body body:PositionDto):DriverRouteDto?
 @GET("/v1/driver/route/{driverId}") suspend fun route(@Path("driverId")driverId:String):DriverRouteDto?
}
