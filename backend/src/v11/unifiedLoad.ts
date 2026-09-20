export type Provider="trans.eu"|"timocom"|"transporeon"|"mock";
export type Geo={lat:number;lon:number};
export type UnifiedLoad={
 provider:Provider; externalId:string;
 pickup:Geo; delivery:Geo; pickupTime?:string;
 priceEur:number; distanceKm:number; vehicleCompatible:boolean;
 raw?:unknown;
};
