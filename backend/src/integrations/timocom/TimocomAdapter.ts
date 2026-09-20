export type TimocomOffer = {
  id: string;
  priceEur?: number;
  pickup?: { lat: number; lon: number };
  delivery?: { lat: number; lon: number };
  raw: unknown;
};

export interface TimocomTransportClient {
  searchFreightOffers(input: {lat: number; lon: number; radiusKm: number}): Promise<TimocomOffer[]>;
  createTransportOrder?(offerId: string): Promise<unknown>;
  getTracking?(shipmentId: string): Promise<unknown>;
}

export class TimocomAdapter {
  constructor(private readonly client: TimocomTransportClient) {}
  async search(lat: number, lon: number, radiusKm: number) {
    return this.client.searchFreightOffers({lat, lon, radiusKm});
  }
}
