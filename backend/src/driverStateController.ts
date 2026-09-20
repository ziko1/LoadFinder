import {detectArrival} from "./geofenceEngine";
export type Route={
 driverId:string;loadId:string;
 pickup:{lat:number;lon:number};
 delivery:{lat:number;lon:number};
 status:"TO_PICKUP"|"LOADED"|"TO_DELIVERY"|"DELIVERED"
};
export class DriverStateController{
 private routes=new Map<string,Route>();
 set(route:Route){this.routes.set(route.driverId,route);return route}
 get(driverId:string){return this.routes.get(driverId)??null}
 position(driverId:string,point:{lat:number;lon:number}){
  const route=this.get(driverId);if(!route)return null;
  if(route.status==="TO_PICKUP"&&detectArrival(point,route.pickup,250))
    route.status="LOADED";
  if((route.status==="LOADED"||route.status==="TO_DELIVERY")&&
     detectArrival(point,route.delivery,250))
    route.status="DELIVERED";
  this.set(route);return route;
 }
}
