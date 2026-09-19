export type Point={lat:number;lon:number};
export type RouteResult={distanceKm:number;durationMinutes:number;polyline?:string};

export interface RoutingProvider{
 route(from:Point,to:Point):Promise<RouteResult>;
}

/** Configurable HTTP routing client. Adapt response parsing to chosen provider. */
export class HttpRoutingProvider implements RoutingProvider{
 constructor(private baseUrl:string){}
 async route(from:Point,to:Point){
  const url=`${this.baseUrl.replace(/\/$/,"")}/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
  const r=await fetch(url);
  if(!r.ok)throw new Error(`ROUTING_HTTP_${r.status}`);
  const b:any=await r.json();
  const x=b?.routes?.[0];
  if(!x)throw new Error("ROUTE_NOT_FOUND");
  return {distanceKm:Number(x.distance)/1000,durationMinutes:Number(x.duration)/60};
 }
}
