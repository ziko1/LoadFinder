export type SearchPolicy = {
  enabled: boolean;
  radiusKm: number;
  cooldownMs: number;
  maxResults: number;
};

export function validatePolicy(p: SearchPolicy) {
  if (!Number.isFinite(p.radiusKm) || p.radiusKm < 1 || p.radiusKm > 250) throw new Error('radiusKm out of range');
  if (!Number.isInteger(p.maxResults) || p.maxResults < 1 || p.maxResults > 100) throw new Error('maxResults out of range');
  if (!Number.isInteger(p.cooldownMs) || p.cooldownMs < 1000) throw new Error('cooldownMs out of range');
  return p;
}
