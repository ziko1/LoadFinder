export type ActiveRoute = {
  driverId: string;
  loadId: string;
  pickup: { lat: number; lon: number };
  delivery: { lat: number; lon: number };
  status: "TO_PICKUP" | "LOADED" | "TO_DELIVERY" | "DELIVERED";
};

export class DriverRouteState {
  private routes = new Map<string, ActiveRoute>();

  set(route: ActiveRoute) {
    this.routes.set(route.driverId, route);
    return route;
  }

  get(driverId: string) {
    return this.routes.get(driverId) ?? null;
  }

  clear(driverId: string) {
    this.routes.delete(driverId);
  }
}
