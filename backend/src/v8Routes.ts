import { NextLoadController } from "./nextLoadController";
import { TransEuWebhookStore } from "./transEuWebhookStore";

export function registerV8Routes(app: any) {
  const nextLoad = new NextLoadController();
  const events = new TransEuWebhookStore();

  app.post("/v1/vehicle/position", async (req: any) => {
    const body = req.body;
    if (!body?.driverId || !Number.isFinite(body.lat) || !Number.isFinite(body.lon)) {
      return { error: "invalid_position" };
    }
    return nextLoad.updatePosition({
      driverId: String(body.driverId),
      lat: Number(body.lat),
      lon: Number(body.lon),
      accuracyM: body.accuracyM,
      speedKmh: body.speedKmh,
      headingDeg: body.headingDeg,
      recordedAt: body.recordedAt ?? new Date().toISOString()
    });
  });

  app.post("/v1/webhooks/trans-eu/v8", async (req: any) => {
    const body = req.body ?? {};
    const event = {
      provider: "trans.eu" as const,
      id: String(body.id ?? `${body.event_name}:${body.occurred_at}`),
      eventName: String(body.event_name ?? "unknown"),
      occurredAt: String(body.occurred_at ?? new Date().toISOString()),
      data: body.data
    };
    return { received: true, duplicate: !events.add(event) };
  });

  app.get("/v1/webhooks/trans-eu/events", async () => events.all());
}
