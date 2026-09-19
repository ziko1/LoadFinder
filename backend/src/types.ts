export type GeoPoint = { lat: number; lon: number };

export type Load = {
  id: string;
  exchange: string;
  pickupCity: string;
  pickup: GeoPoint;
  deliveryCity: string;
  delivery: GeoPoint;
  weightKg: number;
  volumeM3: number;
  vehicleType: string;
  priceEur: number;
  distanceKm: number;
  pickupDistanceKm: number;
  emptyDistanceKm: number;
  pricePerKm: number;
  matchScore: number;
  status: "AVAILABLE"|"PENDING"|"ACCEPTED"|"EXPIRED";
};

export type SearchParams = {
  lat: number;
  lon: number;
  radiusKm: number;
  minPriceEur?: number;
  minPricePerKm?: number;
  maxEmptyKm?: number;
  minMatchScore?: number;
  vehicleType?: string;
};