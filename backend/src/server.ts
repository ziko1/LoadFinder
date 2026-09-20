import Fastify from "fastify";
import { config } from "./config";
import { MemoryAccessTokenStore, TransEuClient } from "./integrations/transEu/transEuClient";
import { createTransEuAuthorizationUrl, handleTransEuCallback } from "./integrations/transEu/oauth";
import { TransEuWorkflow } from "./transEuWorkflow";
import { registerV8Routes } from "./v8Routes";
import { registerDriverRoutes } from "./driverRoutes";
import { registerV13 } from "./v13";
import { registerV14 } from "./v14";
import { EncryptedTokenStore } from "./v14";
import { authenticate } from "./v13";
import { UnifiedExchangeSearch } from "./v11/exchangeAggregator";
import { MockAdapter } from "./exchanges/MockAdapter";
import { TransEuUnifiedProvider } from "./exchanges/TransEuUnifiedProvider";
import { registerV15Routes } from "./v15/routes";
import { registerV16Routes } from "./v16/routes";
import { registerV17Routes } from "./v17/routes";
import { registerV19 } from "./v19";

const app = Fastify({ logger: true });

const isProduction = String(process.env.NODE_ENV ?? "").toLowerCase() === "production";
if (isProduction && (!config.databaseUrl || !process.env.TOKEN_ENCRYPTION_KEY)) {
  throw new Error("PRODUCTION_AUTH_STORAGE_REQUIRED");
}

const tokens = config.databaseUrl && process.env.TOKEN_ENCRYPTION_KEY
  ? new EncryptedTokenStore()
  : new MemoryAccessTokenStore();
const transEu = new TransEuClient(tokens);
const workflow = new TransEuWorkflow(transEu);
const mock = new MockAdapter();
const transEuProvider = new TransEuUnifiedProvider(transEu);
const providers = [
  transEuProvider,
  ...(String(process.env.LOADFINDER_ENABLE_MOCK_PROVIDER ?? "false") === "true" ? [{
    name: "mock" as const,
    async search(input: {lat:number;lon:number;radiusKm:number}) {
      const rows = await mock.searchLoads({ ...input });
      return rows.map(x => ({
        provider: "mock" as const, externalId: x.id, pickup: x.pickup, delivery: x.delivery,
        pickupTime: undefined, priceEur: x.priceEur, distanceKm: x.distanceKm, vehicleCompatible: true, raw: x
      }));
    }
  }] : [])
];
const engine = new UnifiedExchangeSearch(providers);

function unifiedToApiLoad(x: any) {
  const raw = x.raw ?? {};
  return {
    id: `${x.provider}:${x.externalId}`,
    exchange: String(x.provider).toUpperCase(),
    pickupCity: String(raw.pickupCity ?? raw.raw?.loadfinder?.pickupCity ?? "Unknown"),
    pickup: x.pickup,
    deliveryCity: String(raw.deliveryCity ?? raw.raw?.loadfinder?.deliveryCity ?? "Unknown"),
    delivery: x.delivery,
    weightKg: Number(raw.weightKg ?? raw.raw?.loadfinder?.weightKg ?? 0),
    volumeM3: Number(raw.volumeM3 ?? 0),
    vehicleType: String(raw.vehicleType ?? raw.raw?.loadfinder?.vehicleType ?? "UNKNOWN"),
    priceEur: Number(x.priceEur),
    distanceKm: Number(x.distanceKm),
    pickupDistanceKm: Number(raw.pickupDistanceKm ?? 0),
    emptyDistanceKm: Number(raw.emptyDistanceKm ?? 0),
    pricePerKm: Number(x.distanceKm) > 0 ? Number(x.priceEur) / Number(x.distanceKm) : 0,
    matchScore: Math.max(0, Math.min(100, Math.round(Number(raw.matchScore ?? raw.score ?? 0)))),
    status: "AVAILABLE"
  };
}

function calculateApiMatchScore(load: ReturnType<typeof unifiedToApiLoad>, radiusKm: number, maxEmptyKm: number, minPricePerKm: number, vehicleType: string) {
  const emptyRatio = maxEmptyKm > 0 ? Math.min(1, load.emptyDistanceKm / maxEmptyKm) : 1;
  const radiusRatio = radiusKm > 0 ? Math.min(1, load.pickupDistanceKm / radiusKm) : 1;
  const vehiclePoints = !vehicleType || load.vehicleType === "UNKNOWN" ? 10 : load.vehicleType.toUpperCase() === vehicleType.toUpperCase() ? 25 : 0;
  const pricePoints = load.pricePerKm >= minPricePerKm ? 25 : 10;
  return Math.max(0, Math.min(100, Math.round((1-radiusRatio)*30 + vehiclePoints + pricePoints + (1-emptyRatio)*20)));
}

registerV8Routes(app);
registerDriverRoutes(app);
registerV13(app);
registerV15Routes(app);
registerV16Routes(app);
registerV17Routes(app);
registerV19(app);

registerV14(app, engine, async (_driverId, load, amountEur) => {
  if (load.provider === "mock") return mock.submitOffer(load.externalId, amountEur);
  if (load.provider === "trans.eu") return workflow.negotiate(_driverId, load.externalId, amountEur);
  throw new Error(`BID_PROVIDER_NOT_IMPLEMENTED:${load.provider}`);
});


type LoadsSearchParams = {
  lat: number; lon: number; radiusKm: number; minPricePerKm: number;
  maxEmptyKm: number; minMatchScore: number; vehicleType: string;
};

async function runLoadsSearch(req: any, reply: any): Promise<{ loads: ReturnType<typeof unifiedToApiLoad>[] } | null> {
  const lat = Number(req.query?.lat);
  const lon = Number(req.query?.lon);
  const radiusKm = Number(req.query?.radiusKm ?? 100);
  const minPricePerKm = Number(req.query?.minPricePerKm ?? 0);
  const maxEmptyKm = Number(req.query?.maxEmptyKm ?? 1e9);
  const minMatchScore = Number(req.query?.minMatchScore ?? 0);
  const vehicleType = String(req.query?.vehicleType ?? "");
  if (![lat, lon, radiusKm].every(Number.isFinite) ||
      Math.abs(lat) > 90 || Math.abs(lon) > 180 ||
      radiusKm <= 0 || radiusKm > 250) {
    reply.code(400).send({ error: "invalid_search_params" });
    return null;
  }
  const user = await authenticate(req);
  const loads = await engine.search({ lat, lon, radiusKm }, user.driverId);
  const filtered = loads
    .map(unifiedToApiLoad)
    .filter((x: any) => x.pickupDistanceKm <= radiusKm)
    .filter((x: any) => x.pricePerKm >= minPricePerKm)
    .filter((x: any) => x.emptyDistanceKm <= maxEmptyKm)
    .map((x: any) => ({ ...x, matchScore: calculateApiMatchScore(x, radiusKm, maxEmptyKm, minPricePerKm, vehicleType) }))
    .filter((x: any) => x.matchScore >= minMatchScore)
    .sort((a: any, b: any) => b.matchScore - a.matchScore);
  return { loads: filtered };
}

app.get("/v1/loads", async (req: any, reply) => {
  try {
    const result = await runLoadsSearch(req, reply);
    return result?.loads ?? [];
  } catch (e: any) {
    return reply.code(e?.message === "UNAUTHENTICATED" ? 401 : 400).send({ error: e?.message ?? "load_search_failed" });
  }
});

app.get("/v1/loads/page", async (req: any, reply) => {
  try {
    const result = await runLoadsSearch(req, reply);
    if (!result) return;
    const page = Math.max(1, Math.min(1000, Math.floor(Number(req.query?.page ?? 1))));
    const pageSize = Math.max(1, Math.min(50, Math.floor(Number(req.query?.pageSize ?? 25))));
    const start = (page - 1) * pageSize;
    const items = result.loads.slice(start, start + pageSize);
    return {
      items,
      page,
      pageSize,
      total: result.loads.length,
      hasMore: start + items.length < result.loads.length
    };
  } catch (e: any) {
    return reply.code(e?.message === "UNAUTHENTICATED" ? 401 : 400).send({ error: e?.message ?? "load_search_page_failed" });
  }
});

app.get<{ Params: { loadId: string } }>("/v1/loads/:loadId", async (req, reply) => {
  try {
    const user = await authenticate(req);
    const [provider, ...idParts] = String(req.params.loadId).split(":");
    const externalId = idParts.join(":");
    if (provider.toLowerCase() !== "trans.eu" || !externalId) {
      return reply.code(400).send({ error: "unsupported_load_provider" });
    }
    const proposal = await transEu.getProposalDetails(user.driverId, externalId);
    const raw: any = proposal.raw;
    const freight: any = raw?.freight ?? {};
    const spots = Array.isArray(freight.spots) ? freight.spots : [];
    const coords = spots.map((x: any) => x?.place?.coordinates).filter((x: any) =>
      Number.isFinite(Number(x?.latitude)) && Number.isFinite(Number(x?.longitude)));
    const pickup = coords[0] ?? {};
    const delivery = coords[1] ?? {};
    const price = Number(proposal.price?.value ?? freight?.publication?.price?.value ?? 0);
    const distanceKm = Number(freight?.distance ?? 0) / 1000;
    const weightKg = Math.round(Number(freight?.capacity?.value ?? 0) * 1000);
    const body = String(freight?.requirements?.required_truck_bodies?.[0] ?? "UNKNOWN").toUpperCase();
    const vehicleType = body === "CURTAINSIDER" ? "CURTAINSIDER" :
      body === "REFRIGERATED" ? "REFRIGERATED" :
      body === "BOX" ? "BOX" : body === "VAN" ? "VAN" : "UNKNOWN";
    return {
      id: `trans.eu:${externalId}`, exchange: "trans.eu",
      pickupCity: String(spots[0]?.place?.locality ?? "Unknown"),
      deliveryCity: String(spots[1]?.place?.locality ?? "Unknown"),
      priceEur: price, pickupLat: Number(pickup.latitude ?? 0), pickupLon: Number(pickup.longitude ?? 0),
      deliveryLat: Number(delivery.latitude ?? 0), deliveryLon: Number(delivery.longitude ?? 0),
      weightKg, volumeM3: 0, vehicleType, distanceKm,
      pickupDistanceKm: 0, emptyDistanceKm: 0,
      pricePerKm: distanceKm > 0 ? price / distanceKm : 0,
      matchScore: 0, status: String(proposal?.status ?? "AVAILABLE").toUpperCase(),
      offerId: String(proposal.offerId ?? freight?.publication?.offer_id ?? ""),
      version: Number(proposal?.version ?? 1),
      decisionDate: proposal?.decision_date ?? null,
      stage: proposal?.stage ?? null
    };
  } catch (e: any) {
    return reply.code(e?.message === "UNAUTHENTICATED" ? 401 : 400).send({ error: e?.message ?? "load_details_failed" });
  }
});

app.post<{ Params: { loadId: string }; Body: { amountEur: number; confirmed?: boolean } }>("/v1/loads/:loadId/offer", async (req, reply) => {
  try {
    const user = await authenticate(req);
    if (!req.body?.confirmed) return reply.code(400).send({ error: "explicit_confirmation_required" });
    if (!Number.isFinite(req.body.amountEur) || req.body.amountEur <= 0) return reply.code(400).send({ error: "invalid_amount" });
    const [provider, ...idParts] = String(req.params.loadId).split(":");
    const externalId = idParts.join(":");
    if (provider.toLowerCase() !== "trans.eu" || !externalId) {
      return reply.code(400).send({ error: "unsupported_load_provider" });
    }
    const result: any = await workflow.negotiate(user.driverId, externalId, req.body.amountEur);
    return { offerId: String(result?.id ?? result?.offer_id ?? externalId), provider: "trans.eu" };
  } catch (e: any) {
    return reply.code(e?.message === "UNAUTHENTICATED" ? 401 : 400).send({ error: e?.message ?? "offer_failed" });
  }
});

app.post<{ Params: { loadId: string }; Body: { confirmed?: boolean } }>("/v1/loads/:loadId/accept", async (req, reply) => {
  try {
    const user = await authenticate(req);
    if (!req.body?.confirmed) return reply.code(400).send({ error: "explicit_confirmation_required" });
    const [provider, ...idParts] = String(req.params.loadId).split(":");
    const externalId = idParts.join(":");
    if (provider.toLowerCase() !== "trans.eu" || !externalId) {
      return reply.code(400).send({ error: "unsupported_load_provider" });
    }
    const result: any = await workflow.accept(user.driverId, externalId);
    return { bookingId: String(result?.id ?? result?.booking_id ?? externalId), provider: "trans.eu" };
  } catch (e: any) {
    return reply.code(e?.message === "UNAUTHENTICATED" ? 401 : 400).send({ error: e?.message ?? "accept_failed" });
  }
});

app.get("/health", async () => ({ ok: true, version: process.env.APP_VERSION ?? "0.4.0" }));

app.get("/v1/exchanges/trans-eu/connect", async (req, reply) => {
  try {
    const user = await authenticate(req);
    return reply.redirect(createTransEuAuthorizationUrl(user.driverId));
  } catch {
    return reply.code(401).send({ error: "unauthenticated" });
  }
});

app.get<{ Querystring: { code?: string; state?: string } }>("/v1/exchanges/trans-eu/callback", async (req, reply) => {
  if (!req.query.code || !req.query.state) return reply.code(400).send({ error: "code_and_state_required" });
  try {
    const result = await handleTransEuCallback(req.query.code, req.query.state, tokens);
    return { connected: true, driverId: result.driverId };
  } catch (e: any) {
    return reply.code(400).send({ error: e?.message ?? "oauth_callback_failed" });
  }
});

app.get<{ Querystring: { page?: string; sortBy?: "loading_date" | "unloading_date"; order?: "asc" | "desc" } }>("/v1/exchanges/trans-eu/proposals", async (req, reply) => {
  try {
    const user = await authenticate(req);
    const page = Number(req.query.page ?? 1);
    const sortBy = req.query.sortBy === "unloading_date" ? "unloading_date" : "loading_date";
    const order = req.query.order === "desc" ? "desc" : "asc";
    return await transEu.getFreightProposals(user.driverId, page, sortBy, order);
  } catch (e: any) {
    return reply.code(e?.message === "UNAUTHENTICATED" ? 401 : 400).send({ error: e?.message ?? "trans_eu_proposals_failed" });
  }
});

app.get<{ Params: { freightId: string } }>("/v1/exchanges/trans-eu/proposals/:freightId", async req => {
  const user = await authenticate(req);
  return transEu.getProposalDetails(user.driverId, req.params.freightId);
});

app.post<{ Params: { freightId: string }; Body: { amountEur: number; confirmed?: boolean } }>("/v1/exchanges/trans-eu/proposals/:freightId/negotiate", async (req, reply) => {
  const user = await authenticate(req);
  if (!req.body.confirmed) return reply.code(400).send({ error: "explicit_confirmation_required" });
  if (!Number.isFinite(req.body.amountEur) || req.body.amountEur <= 0) return reply.code(400).send({ error: "invalid_amount" });
  return workflow.negotiate(user.driverId, req.params.freightId, req.body.amountEur);
});

app.post<{ Params: { freightId: string }; Body: { confirmed?: boolean } }>("/v1/exchanges/trans-eu/proposals/:freightId/accept", async (req, reply) => {
  const user = await authenticate(req);
  if (!req.body.confirmed) return reply.code(400).send({ error: "explicit_confirmation_required" });
  return workflow.accept(user.driverId, req.params.freightId);
});

app.get("/v1/exchanges/trans-eu/accepted", async req => {
  const user = await authenticate(req);
  return transEu.getAccepted(user.driverId);
});

app.post("/v1/webhooks/trans-eu", async req => { app.log.info({ event: req.body }, "Trans.eu callback received"); return { received: true }; });

app.listen({ port: config.PORT, host: "0.0.0.0" }).catch((err: unknown) => { app.log.error(err); process.exit(1); });
