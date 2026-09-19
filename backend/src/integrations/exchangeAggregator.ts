import { TimocomAdapter } from "./timocom/TimocomAdapter";

export type UnifiedLoad = {
  provider: "trans.eu" | "timocom" | "mock";
  externalId: string;
  priceEur?: number;
  pickup?: {lat: number; lon: number};
  delivery?: {lat: number; lon: number};
  raw: unknown;
};

export class ExchangeAggregator {
  constructor(private readonly timocom?: TimocomAdapter) {}

  async searchTimocom(lat: number, lon: number, radiusKm: number): Promise<UnifiedLoad[]> {
    if (!this.timocom) return [];
    const loads = await this.timocom.search(lat, lon, radiusKm);
    return loads.map(x => ({
      provider: "timocom",
      externalId: x.id,
      priceEur: x.priceEur,
      pickup: x.pickup,
      delivery: x.delivery,
      raw: x.raw
    }));
  }
}
