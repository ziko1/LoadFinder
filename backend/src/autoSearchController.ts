import { rankNextLoads } from "./nextLoadEngine";
import { calculateProfit } from "./profitEngine";

export type AutoSearchRequest = {
  driverId: string;
  lat: number;
  lon: number;
  radiusKm: number;
  minEurPerKm: number;
  maxEmptyKm: number;
  fuelLitersPer100Km: number;
  fuelPriceEurPerLiter: number;
  tollsEur: number;
  driverCostEur: number;
  otherCostEur: number;
};

export function evaluateLoads(input: AutoSearchRequest, loads: any[]) {
  const ranked = rankNextLoads(
    { lat: input.lat, lon: input.lon },
    loads.map(x => ({
      id: String(x.id),
      pickup: x.pickup,
      delivery: x.delivery,
      priceEur: Number(x.priceEur),
      distanceKm: Number(x.distanceKm),
      pickupTime: x.pickupTime,
      vehicleCompatible: x.vehicleCompatible !== false
    })),
    input.maxEmptyKm,
    input.minEurPerKm
  );

  return ranked.map(x => ({
    ...x,
    profit: calculateProfit({
      loadPriceEur: x.priceEur,
      totalKm: x.totalKm,
      fuelLitersPer100Km: input.fuelLitersPer100Km,
      fuelPriceEurPerLiter: input.fuelPriceEurPerLiter,
      tollsEur: input.tollsEur,
      driverCostEur: input.driverCostEur,
      otherCostEur: input.otherCostEur
    })
  }));
}
