export type SearchPolicy = {
  radiusKm: number;
  minScore: number;
  minEurPerKm: number;
  maxEmptyKm: number;
  notifyCooldownMinutes: number;
};

export const DEFAULT_SEARCH_POLICY: SearchPolicy = {
  radiusKm: 100,
  minScore: 70,
  minEurPerKm: 0.8,
  maxEmptyKm: 100,
  notifyCooldownMinutes: 15
};
