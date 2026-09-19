import {rank as _rank} from "./ranking";
export function rank(current:any,loads:any,b:any){
 return _rank(current,loads,{
  maxEmptyKm:Number(b.maxEmptyKm??100),minEurPerKm:Number(b.minEurPerKm??.8),
  minPriceEur:Number(b.minPriceEur??0),fuelL100:Number(b.fuelL100??9),
  fuelEurL:Number(b.fuelEurL??1.7),tollEur:Number(b.tollEur??0),
  driverCostEur:Number(b.driverCostEur??0),otherCostEur:Number(b.otherCostEur??0)
 });
}
