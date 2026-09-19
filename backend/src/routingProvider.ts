export type Point = { lat: number; lon: number };

export interface RoutingProvider {
  routeDistanceKm(from: Point, to: Point): Promise<number>;
}

/**
 * Fallback only. Road distance is normally longer than geodesic distance.
 * Configure a self-hosted OSRM/GraphHopper/other provider in production.
 */
export class HaversineRoutingProvider implements RoutingProvider {
  async routeDistanceKm(from: Point, to: Point) {
    const R = 6371;
    const rad = (v: number) => v * Math.PI / 180;
    const dLat = rad(to.lat - from.lat);
    const dLon = rad(to.lon - from.lon);
    const a =
      Math.sin(dLat/2)**2 +
      Math.cos(rad(from.lat))*Math.cos(rad(to.lat))*Math.sin(dLon/2)**2;
    return 2 * R * Math.asin(Math.sqrt(a)) * 1.18;
  }
}
