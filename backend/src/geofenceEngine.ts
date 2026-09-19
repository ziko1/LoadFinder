export type Point={lat:number;lon:number};
const rad=(v:number)=>v*Math.PI/180;
export function distanceKm(a:Point,b:Point){
 const dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon);
 const x=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;
 return 6371*2*Math.asin(Math.sqrt(x));
}
export function detectArrival(vehicle:Point,target:Point,radiusM=250){
 return distanceKm(vehicle,target)*1000<=radiusM;
}
