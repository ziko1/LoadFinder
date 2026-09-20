import { ExchangeAdapter } from "./exchanges/ExchangeAdapter";
import { SearchParams } from "./types";
import { matchScore } from "./scoring";

export async function searchAcrossExchanges(
  adapters: ExchangeAdapter[],
  p: SearchParams
) {
  const results = (await Promise.all(
    adapters.map(async adapter => {
      try {
        const loads = await adapter.searchLoads(p);
        return loads.map(load => ({
          ...load,
          matchScore: matchScore(load, p)
        }));
      } catch (error) {
        console.error(`Exchange ${adapter.name} failed`, error);
        return [];
      }
    })
  )).flat();

  return results
    .filter(x =>
      x.pickupDistanceKm <= p.radiusKm &&
      x.priceEur >= (p.minPriceEur ?? 0) &&
      x.pricePerKm >= (p.minPricePerKm ?? 1.2) &&
      x.emptyDistanceKm <= (p.maxEmptyKm ?? 50) &&
      x.matchScore >= (p.minMatchScore ?? 80)
    )
    // Same route/price can appear on multiple exchanges.
    .sort((a,b) => b.matchScore - a.matchScore);
}
