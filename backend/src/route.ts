export function routeCompatibility(
  pickup:{lat:number,lon:number},
  destination?:{lat:number,lon:number},
  preferred?:{lat:number,lon:number}
) {
  if (!destination || !preferred) return 0.5;
  const ax=destination.lat-pickup.lat, ay=destination.lon-pickup.lon;
  const bx=preferred.lat-pickup.lat, by=preferred.lon-pickup.lon;
  const dot=ax*bx+ay*by;
  const na=Math.hypot(ax,ay), nb=Math.hypot(bx,by);
  if (!na || !nb) return 0.5;
  return Math.max(0, Math.min(1, (dot/(na*nb)+1)/2));
}
