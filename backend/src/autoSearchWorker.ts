import { searchAcrossExchanges } from "./autoSearch";
import { ExchangeAdapter } from "./exchanges/ExchangeAdapter";
import { SearchParams } from "./types";
import { dedupeLoads } from "./dedupe";
import { PushGateway } from "./push";

const lastSeen = new Map<string,Set<string>>();

export async function runAutoSearch(
  driverId:string,
  p:SearchParams,
  adapters:ExchangeAdapter[],
  push:PushGateway
) {
  const results = dedupeLoads(await searchAcrossExchanges(adapters,p));
  const seen = lastSeen.get(driverId) ?? new Set<string>();

  for (const load of results.slice(0,10)) {
    if (!seen.has(load.id) && load.matchScore >= (p.minMatchScore ?? 80)) {
      await push.send(driverId,{
        title:"🔥 New matching load",
        body:`${load.pickupCity} → ${load.deliveryCity} • €${Math.round(load.priceEur)} • ${load.matchScore}%`,
        loadId:load.id,
        deepLink:`loadfinder://load/${load.id}`
      });
      seen.add(load.id);
    }
  }
  lastSeen.set(driverId,seen);
  return results;
}
