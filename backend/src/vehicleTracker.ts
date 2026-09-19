export type VehiclePosition = {
  driverId: string;
  lat: number;
  lon: number;
  accuracyM?: number;
  speedKmh?: number;
  headingDeg?: number;
  recordedAt: string;
};

export class VehicleTracker {
  private readonly positions = new Map<string, VehiclePosition>();

  update(position: VehiclePosition) {
    this.positions.set(position.driverId, position);
    return position;
  }

  get(driverId: string) {
    return this.positions.get(driverId) ?? null;
  }
}
