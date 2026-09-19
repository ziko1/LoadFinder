import { Pool } from 'pg';
import type { UnifiedLoad } from '../v11/unifiedLoad';

export class LoadRepository {
  constructor(private readonly pool: Pool) {}

  async upsert(load: UnifiedLoad & { score?: number; profitEur?: number }) {
    await this.pool.query(`
      insert into load_snapshots(provider,external_id,pickup,delivery,pickup_time,price_eur,distance_km,score,profit_eur,payload)
      values($1,$2,ST_SetSRID(ST_MakePoint($3,$4),4326)::geography,ST_SetSRID(ST_MakePoint($5,$6),4326)::geography,$7,$8,$9,$10,$11,$12)
      on conflict(provider,external_id) do update set
        pickup=excluded.pickup, delivery=excluded.delivery, pickup_time=excluded.pickup_time,
        price_eur=excluded.price_eur, distance_km=excluded.distance_km, score=excluded.score,
        profit_eur=excluded.profit_eur, payload=excluded.payload, last_seen_at=now()`,
      [load.provider, load.externalId, load.pickup.lon, load.pickup.lat, load.delivery.lon, load.delivery.lat,
       load.pickupTime ?? null, load.priceEur ?? null, load.distanceKm ?? null, load.score ?? null,
       load.profitEur ?? null, JSON.stringify(load.raw ?? load)]);
  }

  async prune(hours = 72) {
    await this.pool.query(`delete from load_snapshots where last_seen_at < now() - ($1 || ' hours')::interval`, [hours]);
  }
}
