import Redis from 'ioredis';

export type SearchJob = { driverExternalSubject: string; lat: number; lon: number; radiusKm: number };

export class SearchQueue {
  private readonly redis: Redis;
  constructor(url = process.env.REDIS_URL ?? 'redis://localhost:6379') { this.redis = new Redis(url); }
  async enqueue(job: SearchJob) {
    await this.redis.lpush('loadfinder:auto-search', JSON.stringify(job));
  }
  async dequeue(timeoutSeconds = 5): Promise<SearchJob | null> {
    const item = await this.redis.brpop('loadfinder:auto-search', timeoutSeconds);
    return item ? JSON.parse(item[1]) as SearchJob : null;
  }
  async close() { await this.redis.quit(); }
}
