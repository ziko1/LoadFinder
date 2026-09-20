import { Pool } from "pg";
import { config } from "./config";

export class V14Persistence {
  readonly pool = new Pool({ connectionString: config.databaseUrl });
  async driverUuid(externalSubject: string) {
    const r = await this.pool.query(
      `insert into drivers(id,external_subject) values(gen_random_uuid(),$1)
       on conflict(external_subject) do update set external_subject=excluded.external_subject
       returning id`, [externalSubject]
    );
    return r.rows[0].id as string;
  }
  async savePushToken(externalSubject: string, token: string, platform="android") {
    const driverId = await this.driverUuid(externalSubject);
    await this.pool.query(
      `insert into push_tokens(driver_id,token,platform,last_seen_at) values($1,$2,$3,now())
       on conflict(driver_id,token) do update set platform=excluded.platform,last_seen_at=now()`,
      [driverId, token, platform]
    );
  }
  async recentLoads(limit=100) {
    const r=await this.pool.query(
      `select provider,external_id,price_eur,ST_Y(pickup::geometry) as pickup_lat,ST_X(pickup::geometry) as pickup_lon,
       ST_Y(delivery::geometry) as delivery_lat,ST_X(delivery::geometry) as delivery_lon,distance_km
       from loads order by created_at desc limit $1`,[limit]);
    return r.rows;
  }
}
