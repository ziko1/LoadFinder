import Redis from 'ioredis';

export type SearchJob = { driverExternalSubject: string; lat: number; lon: number; radiusKm: number };

export class SearchQueue {
  private readonly redis: Redis;
  constructor(private url = process.env.REDIS_URL ?? '') {
    this.redis = new Redis(url || 'redis://localhost:6379', { lazyConnect:true, maxRetriesPerRequest:1, retryStrategy:()=>null });
    this.redis.on('error', ()=>{});
  }
  async enqueue(job: SearchJob) {
    if(!this.url) throw Object.assign(new Error('REDIS_URL_REQUIRED'), {statusCode:503});
    await this.redis.lpush('loadfinder:auto-search', JSON.stringify(job));
  }
  async dequeue(timeoutSeconds = 5): Promise<SearchJob | null> {
    if(!this.url) throw new Error('REDIS_URL_REQUIRED');
    const item = await this.redis.brpop('loadfinder:auto-search', timeoutSeconds);
    return item ? JSON.parse(item[1]) as SearchJob : null;
  }
  async close() { this.redis.disconnect(); }
}
