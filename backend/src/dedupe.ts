import { Load } from "./types";

function norm(s:string) {
  return s.trim().toLowerCase().replace(/\s+/g," ");
}

/**
 * Conservative deduplication: only merge records when route/city/price
 * are close enough. Never hide materially different offers.
 */
export function dedupeLoads(loads:Load[]) {
  const groups = new Map<string,Load>();
  for (const l of loads) {
    const key = [
      norm(l.pickupCity),
      norm(l.deliveryCity),
      Math.round(l.priceEur / 10),
      Math.round(l.weightKg / 100),
      l.vehicleType.toUpperCase()
    ].join("|");

    const old = groups.get(key);
    if (!old || l.matchScore > old.matchScore) groups.set(key,l);
  }
  return [...groups.values()].sort((a,b)=>b.matchScore-a.matchScore);
}
