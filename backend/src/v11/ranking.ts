import {UnifiedLoad} from "./unifiedLoad";
const R=6371,rad=(v:number)=>v*Math.PI/180;
export function geoKm(a:{lat:number;lon:number},b:{lat:number;lon:number}){
 const dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon);
 const x=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;
 return R*2*Math.asin(Math.sqrt(x));
}
export type RankingConfig={
 maxEmptyKm:number; minEurPerKm:number; minPriceEur:number;
 fuelL100:number; fuelEurL:number; tollEur:number; driverCostEur:number; otherCostEur:number;
};
export function rank(current:{lat:number;lon:number},loads:UnifiedLoad[],c:RankingConfig){
 return loads.map(l=>{
  const emptyKm=geoKm(current,l.pickup);
  const totalKm=emptyKm+l.distanceKm;
  const fuel=totalKm*c.fuelL100/100*c.fuelEurL;
  const cost=fuel+c.tollEur+c.driverCostEur+c.otherCostEur;
  const profit=l.priceEur-cost;
  const eurKm=totalKm?l.priceEur/totalKm:0;
  const score=(l.vehicleCompatible?30:0)+Math.max(0,30-emptyKm*.3)+Math.min(20,eurKm*15)+Math.min(20,Math.max(0,profit)/50);
  return {...l,emptyKm,totalKm,fuelCostEur:fuel,profitEur:profit,eurPerKm:eurKm,score};
 }).filter(x=>x.vehicleCompatible&&x.emptyKm<=c.maxEmptyKm&&x.priceEur>=c.minPriceEur&&x.eurPerKm>=c.minEurPerKm)
 .sort((a,b)=>b.score-a.score);
}
