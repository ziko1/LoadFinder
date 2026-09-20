import { Pool } from 'pg';
import { UnifiedExchangeSearch } from '../v11/exchangeAggregator';
import { rank } from '../v11/ranking';
import { LoadRepository } from './loadRepository';
import { SearchQueue, type SearchJob } from './redisQueue';
import { PushGateway } from '../push';

export class AutoSearchService {
  constructor(private readonly pool: Pool, private readonly engine: UnifiedExchangeSearch, private readonly push: PushGateway) {}

  async run(job: SearchJob) {
    const repo = new LoadRepository(this.pool);
    const run = await this.pool.query('insert into auto_search_runs(driver_id) select id from drivers where external_subject=$1 returning id', [job.driverExternalSubject]);
    const runId = run.rows[0]?.id;
    if (!runId) throw new Error('DRIVER_NOT_FOUND');
    try {
      const loads = await this.engine.search({lat: job.lat, lon: job.lon, radiusKm: job.radiusKm});
      const ranked = rank({lat: job.lat, lon: job.lon}, loads, {} as any);
      for (const load of ranked.slice(0, 100)) await repo.upsert(load as any);
      await this.pool.query('update auto_search_runs set finished_at=now(),found_count=$2 where id=$1',[runId, ranked.length]);
      return ranked;
    } catch (e: any) {
      await this.pool.query('update auto_search_runs set finished_at=now(),error=$2 where id=$1',[runId,String(e?.message ?? e)]);
      throw e;
    }
  }

  async startWorker(signal?: AbortSignal) {
    const queue = new SearchQueue();
    while (!signal?.aborted) {
      const job = await queue.dequeue(5);
      if (!job) continue;
      try { await this.run(job); } catch { /* persisted in auto_search_runs */ }
    }
    await queue.close();
  }
}
