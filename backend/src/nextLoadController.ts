import { evaluateLoads, AutoSearchRequest } from "./autoSearchController";
import { VehicleTracker } from "./vehicleTracker";
import { LogPushGateway } from "./pushGateway";

export class NextLoadController {
  constructor(
    private readonly tracker = new VehicleTracker(),
    private readonly push = new LogPushGateway()
  ) {}

  async updatePosition(position: Parameters<VehicleTracker["update"]>[0]) {
    return this.tracker.update(position);
  }

  async evaluate(input: AutoSearchRequest, loads: any[]) {
    const ranked = evaluateLoads(input, loads);
    const best = ranked[0];

    if (best && best.score >= 70) {
      await this.push.send({
        driverId: input.driverId,
        title: "🔥 Знайдено вигідний вантаж",
        body: `${best.priceEur.toFixed(0)} EUR • ${best.emptyKm.toFixed(0)} км порожнього`,
        data: { loadId: best.id, action: "OPEN_LOAD" }
      });
    }

    return ranked;
  }
}
