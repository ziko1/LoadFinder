import { Pool } from 'pg';
import { SearchQueue, type SearchJob } from '../v15/redisQueue';

export class AutoSearchScheduler {
  constructor(private readonly pool: Pool, private readonly queue: SearchQueue) {}

  async tick(limit = 100) {
    const client = await this.pool.connect();
    const queued: SearchJob[] = [];
    try {
      await client.query('begin');
      const { rows } = await client.query(`
        select d.external_subject, p.lat, p.lon, s.radius_km, d.id
        from auto_search_state s
        join drivers d on d.id=s.driver_id
        join driver_search_positions p on p.driver_id=d.id
        where s.enabled=true
          and (s.next_run_at is null or s.next_run_at <= now())
        order by coalesce(s.next_run_at, to_timestamp(0))
        for update of s skip locked
        limit $1`, [limit]);

      for (const r of rows) {
        queued.push({
          driverExternalSubject: String(r.external_subject),
          lat: Number(r.lat), lon: Number(r.lon), radiusKm: Number(r.radius_km)
        });
        await client.query(`update auto_search_state
          set last_run_at=now(), next_run_at=now()+make_interval(secs=>interval_seconds), updated_at=now()
          where driver_id=$1`, [r.id]);
      }
      await client.query('commit');
    } catch (e) {
      await client.query('rollback');
      throw e;
    } finally {
      client.release();
    }

    for (const job of queued) await this.queue.enqueue(job);
    return queued.length;
  }

  async close() { await this.queue.close(); }
}
