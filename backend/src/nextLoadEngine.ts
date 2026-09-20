export type GeoPoint = { lat: number; lon: number };

export type CandidateLoad = {
  id: string;
  pickup: GeoPoint;
  delivery: GeoPoint;
  priceEur: number;
  distanceKm: number;
  pickupTime?: string;
  vehicleCompatible: boolean;
};

const toRad = (v: number) => v * Math.PI / 180;

export function airDistanceKm(a: GeoPoint, b: GeoPoint) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) *
    Math.cos(toRad(b.lat)) *
    Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function rankNextLoads(
  currentDelivery: GeoPoint,
  candidates: CandidateLoad[],
  maxEmptyKm: number,
  minEurPerKm: number
) {
  return candidates
    .map(load => {
      const emptyKm = airDistanceKm(currentDelivery, load.pickup);
      const totalKm = emptyKm + load.distanceKm;
      const eurPerKm = totalKm > 0 ? load.priceEur / totalKm : 0;
      const score =
        (load.vehicleCompatible ? 35 : 0) +
        Math.max(0, 30 - emptyKm) +
        Math.min(25, eurPerKm * 20) +
        Math.min(10, load.priceEur / 100);

      return { ...load, emptyKm, totalKm, eurPerKm, score };
    })
    .filter(x => x.emptyKm <= maxEmptyKm && x.eurPerKm >= minEurPerKm && x.vehicleCompatible)
    .sort((a, b) => b.score - a.score);
}
