import { Load } from "./types";

export function rankNextLoads(loads:Load[], delivery:{lat:number,lon:number}) {
  // Backend currently receives pickupDistanceKm from the exchange adapter.
  // A production route engine should calculate road distance + detour.
  return [...loads]
    .sort((a,b)=>{
      const scoreA = a.matchScore - a.emptyDistanceKm*0.25;
      const scoreB = b.matchScore - b.emptyDistanceKm*0.25;
      return scoreB-scoreA;
    });
}
