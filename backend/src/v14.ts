import crypto from 'node:crypto';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { Pool } from 'pg';
import { z } from 'zod';
import { authenticate, RedisRateLimiter } from './v13';
import { calculateProfit } from './profitEngine';
import { UnifiedExchangeSearch } from './v11/exchangeAggregator';
import { rank } from './v11/ranking';
import type { UnifiedLoad } from './v11/unifiedLoad';
import { shouldBid, type AutoBidPolicy } from './v11/autoBidPolicy';
import { config } from './config';
import { V14Persistence } from './v14Persistence';

export type SecretToken = { accessToken: string; expiresAt?: number };

export class EncryptedTokenStore {
  private readonly key: Buffer;
  private readonly pool: Pool;
  async close(){await this.pool.end();}
  constructor(masterKey = process.env.TOKEN_ENCRYPTION_KEY ?? '') {
    if (!masterKey) throw new Error('TOKEN_ENCRYPTION_KEY_REQUIRED');
    this.key = crypto.createHash('sha256').update(masterKey).digest();
    this.pool = new Pool({ connectionString: config.databaseUrl });
  }
  private encrypt(value: string) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return { iv: iv.toString('base64url'), ciphertext: ciphertext.toString('base64url'), tag: cipher.getAuthTag().toString('base64url') };
  }
  private decrypt(iv: string, ciphertext: string, tag: string) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8');
  }
  private async resolveDriverId(externalSubject: string) {
    const r = await this.pool.query('select id from drivers where external_subject=$1', [externalSubject]);
    return r.rowCount ? String(r.rows[0].id) : null;
  }
  async get(externalSubject: string): Promise<string | null> {
    const driverId = await this.resolveDriverId(externalSubject);
    if (!driverId) return null;
    const r = await this.pool.query('select access_token_enc, access_token_iv, access_token_tag, refresh_token_enc, refresh_token_iv, refresh_token_tag, expires_at from trans_eu_connections where driver_id=$1', [driverId]);
    if (!r.rowCount) return null;
    const row = r.rows[0];
    if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) return null;
    return this.decrypt(row.access_token_iv, row.access_token_enc, row.access_token_tag);
  }
  async set(externalSubject: string, token: string, expiresAt?: number, refreshToken?: string) {
    const existing = await this.pool.query(
      `insert into drivers(id,external_subject) values(gen_random_uuid(),$1) on conflict(external_subject) do update set external_subject=excluded.external_subject returning id`, [externalSubject]);
    const driverId = String(existing.rows[0].id);
    const enc = this.encrypt(token);
    const refresh = refreshToken ? this.encrypt(refreshToken) : null;
    await this.pool.query(`
      insert into trans_eu_connections(
        driver_id,access_token_enc,access_token_iv,access_token_tag,
        refresh_token_enc,refresh_token_iv,refresh_token_tag,expires_at,updated_at
      )
      values($1,$2,$3,$4,$5,$6,$7,$8,now())
      on conflict(driver_id) do update set
        access_token_enc=excluded.access_token_enc,
        access_token_iv=excluded.access_token_iv,
        access_token_tag=excluded.access_token_tag,
        refresh_token_enc=coalesce(excluded.refresh_token_enc, trans_eu_connections.refresh_token_enc),
        refresh_token_iv=coalesce(excluded.refresh_token_iv, trans_eu_connections.refresh_token_iv),
        refresh_token_tag=coalesce(excluded.refresh_token_tag, trans_eu_connections.refresh_token_tag),
        expires_at=excluded.expires_at, updated_at=now()`,
      [driverId, enc.ciphertext, enc.iv, enc.tag,
       refresh?.ciphertext ?? null, refresh?.iv ?? null, refresh?.tag ?? null,
       expiresAt ? new Date(expiresAt) : null]);
  }

  async getRefreshToken(externalSubject: string): Promise<string | null> {
    const driverId = await this.resolveDriverId(externalSubject);
    if (!driverId) return null;
    const r = await this.pool.query(
      `select refresh_token_enc, refresh_token_iv, refresh_token_tag
       from trans_eu_connections where driver_id=$1`, [driverId]);
    if (!r.rowCount || !r.rows[0].refresh_token_enc) return null;
    const row = r.rows[0];
    return this.decrypt(row.refresh_token_iv, row.refresh_token_enc, row.refresh_token_tag);
  }

  async setRefreshToken(externalSubject: string, refreshToken: string): Promise<void> {
    const driverId = await this.resolveDriverId(externalSubject);
    if (!driverId) return;
    const enc = this.encrypt(refreshToken);
    await this.pool.query(
      `update trans_eu_connections
       set refresh_token_enc=$2, refresh_token_iv=$3, refresh_token_tag=$4, updated_at=now()
       where driver_id=$1`,
      [driverId, enc.ciphertext, enc.iv, enc.tag]);
  }
}

const SearchBody = z.object({
  lat: z.number().finite(), lon: z.number().finite(), radiusKm: z.number().positive().max(250).default(100),
  maxEmptyKm: z.number().nonnegative().default(100), minEurPerKm: z.number().nonnegative().default(0.8), minPriceEur: z.number().nonnegative().default(0),
  fuelL100: z.number().positive().default(9), fuelEurL: z.number().positive().default(1.7), tollEur: z.number().nonnegative().default(0), driverCostEur: z.number().nonnegative().default(0), otherCostEur: z.number().nonnegative().default(0)
});

const AutoBidBody = z.object({
  load: z.any(), amountEur: z.number().positive(), confirmed: z.boolean().default(false),
  policy: z.object({ enabled: z.boolean().default(false), minScore: z.number().min(0).max(100).default(80), minProfitEur: z.number().nonnegative().default(100), maxBidsPerHour: z.number().int().positive().max(100).default(3), maxBidsPerDay: z.number().int().positive().max(50).default(10), maxBidEur: z.number().positive().default(10000) }).default({})
});

export function createV14Workflow(engine: UnifiedExchangeSearch, submitBid: (driverId: string, load: UnifiedLoad, amountEur: number) => Promise<unknown>) {
  const limiter = new RedisRateLimiter();
  const persistence = config.databaseUrl ? new V14Persistence() : undefined;
  const pool = persistence?.pool;

  return {
    async close(){limiter.close();await pool?.end();},
    async search(req: FastifyRequest) {
      const user = await authenticate(req);
      if (!(await limiter.allow(`search:${user.driverId}`, 30, 60))) throw Object.assign(new Error('RATE_LIMITED'), { statusCode: 429 });
      const parsed = SearchBody.parse(req.body ?? {});
      const loads = await engine.search({ lat: parsed.lat, lon: parsed.lon, radiusKm: parsed.radiusKm }, user.driverId);
      const ranked = rank({ lat: parsed.lat, lon: parsed.lon }, loads, parsed);
      return { driverId: user.driverId, count: ranked.length, loads: ranked.slice(0, 100) };
    },
    async previewAutoBid(req: FastifyRequest) {
      const user = await authenticate(req);
      const parsed = AutoBidBody.parse(req.body ?? {});
      const policy = parsed.policy as AutoBidPolicy;
      const load = parsed.load as any;
      const decision = shouldBid({ score: Number(load.score ?? 0), profitEur: Number(load.profitEur ?? -Infinity) }, policy);
      return { driverId: user.driverId, wouldBid: decision, reason: decision ? 'policy_match' : 'policy_rejected', liveEnabled: process.env.AUTO_BID_LIVE === 'true', requiresConfirmation: process.env.AUTO_BID_LIVE !== 'true' };
    },
    async executeAutoBid(req: FastifyRequest) {
      const user = await authenticate(req);
      const parsed = AutoBidBody.parse(req.body ?? {});
      const policy = parsed.policy as AutoBidPolicy;
      const load = parsed.load as UnifiedLoad & { score?: number; profitEur?: number };
      if (!shouldBid({ score: Number(load.score ?? 0), profitEur: Number(load.profitEur ?? -Infinity) }, policy)) return { executed: false, reason: 'policy_rejected' };
      if (!policy.enabled) return { executed: false, reason: 'auto_bid_disabled' };
      if (parsed.amountEur > policy.maxBidEur) return { executed: false, reason: 'max_bid_exceeded' };
      if (process.env.AUTO_BID_LIVE !== 'true' && !parsed.confirmed) return { executed: false, reason: 'explicit_confirmation_required' };
      if (!pool) return { executed: false, reason: 'database_required' };
      const driverDbId = await persistence!.driverUuid(user.driverId);
      const hour = await pool!.query(`select count(*)::int as n from auto_bid_events where driver_id=$1 and created_at > now()-interval '1 hour'`, [driverDbId]);
      const day = await pool!.query(`select count(*)::int as n from auto_bid_events where driver_id=$1 and created_at > now()-interval '1 day'`, [driverDbId]);
      if (hour.rows[0].n >= policy.maxBidsPerHour) return { executed: false, reason: 'hour_limit' };
      if (day.rows[0].n >= policy.maxBidsPerDay) return { executed: false, reason: 'day_limit' };
      const result = await submitBid(user.driverId, load, parsed.amountEur);
      await pool!.query(`insert into auto_bid_events(driver_id,provider,external_id,amount_eur,payload) values($1,$2,$3,$4,$5)`, [driverDbId, load.provider, load.externalId, parsed.amountEur, JSON.stringify(result ?? {})]);
      return { executed: true, result };
    },
    async getProfit(req: FastifyRequest) {
      await authenticate(req);
      const input = z.object({ loadPriceEur:z.number(), totalKm:z.number().nonnegative(), fuelLitersPer100Km:z.number().positive(), fuelPriceEurPerLiter:z.number().positive(), tollsEur:z.number().nonnegative(), driverCostEur:z.number().nonnegative(), otherCostEur:z.number().nonnegative() }).parse(req.body ?? {});
      return calculateProfit(input);
    }
  };
}

export function registerV14(app: FastifyInstance, engine: UnifiedExchangeSearch, submitBid: (driverId: string, load: UnifiedLoad, amountEur: number) => Promise<unknown>) {
  const wf = createV14Workflow(engine, submitBid);
  app.addHook('onClose',()=>wf.close());
  const persistence=config.databaseUrl?new V14Persistence():undefined;
  app.addHook('onClose',async()=>{await persistence?.pool.end();});
  app.post('/v14/search', async (req, reply) => { try { return await wf.search(req); } catch (e:any) { return reply.code(e.statusCode ?? 400).send({ error: e.message ?? 'search_failed' }); } });
  app.post('/v14/auto-bid/preview', async (req, reply) => { try { return await wf.previewAutoBid(req); } catch (e:any) { return reply.code(e.statusCode ?? 400).send({ error: e.message ?? 'preview_failed' }); } });
  app.post('/v14/auto-bid/execute', async (req, reply) => { try { return await wf.executeAutoBid(req); } catch (e:any) { return reply.code(e.statusCode ?? 400).send({ error: e.message ?? 'bid_failed' }); } });
  app.post('/v14/profit', async (req, reply) => { try { return await wf.getProfit(req); } catch (e:any) { return reply.code(e.statusCode ?? 400).send({ error: e.message ?? 'profit_failed' }); } });
  app.post('/v14/push-token', async (req, reply) => {
    try {
      const user = await authenticate(req);
      const b = z.object({ token: z.string().min(10).max(4096), platform: z.string().min(2).max(32).default('android') }).parse(req.body ?? {});
      if (!config.databaseUrl) return reply.code(503).send({ error: 'database_required' });
      await persistence!.savePushToken(user.driverId, b.token, b.platform);
      return { ok: true, driverId: user.driverId, platform: b.platform };
    } catch (e:any) {
      return reply.code(e.statusCode ?? 400).send({ error: e.message ?? 'push_token_failed' });
    }
  });
  app.post('/v14/push-token/remove',async(req,reply)=>{
    const user=await authenticate(req);
    const parsed=z.object({token:z.string().min(10).max(4096)}).safeParse(req.body);
    if(!parsed.success)return reply.code(400).send({error:'invalid_token'});
    if(!persistence)return reply.code(503).send({error:'database_required'});
    await persistence.pool.query('delete from push_tokens where token=$1 and driver_id=(select id from drivers where external_subject=$2)',[parsed.data.token,user.driverId]);
    return {ok:true};
  });
}
