import {Load, SearchParams} from "./types";

export function matchScore(load:Load, p:SearchParams):number {
  let s=0;
  s += (1-Math.min(load.pickupDistanceKm/p.radiusKm,1))*30;
  s += p.vehicleType && load.vehicleType===p.vehicleType ? 25 : 10;
  s += p.minPricePerKm && load.pricePerKm>=p.minPricePerKm ? 25 : 10;
  s += (1-Math.min((load.emptyDistanceKm/(p.maxEmptyKm||50)),1))*20;
  return Math.max(0,Math.min(100,Math.round(s)));
}