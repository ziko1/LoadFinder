import crypto from 'node:crypto';
import type {FastifyInstance, FastifyRequest} from 'fastify';
import {Pool} from 'pg';
import Redis from 'ioredis';
import {config} from './config';

export type User={sub:string;driverId:string};

type Jwk={kid?:string;kty:string;n?:string;e?:string;alg?:string;use?:string};
let jwksCache:{url:string;expires:number;keys:Jwk[]}|null=null;

async function getJwks(url:string, refresh=false){
  if(!refresh && jwksCache?.url===url && jwksCache.expires>Date.now()) return jwksCache.keys;
  const r=await fetch(url, {signal:AbortSignal.timeout(5000)}); if(!r.ok) throw new Error(`JWKS_HTTP_${r.status}`);
  const b:any=await r.json();
  jwksCache={url,expires:Date.now()+5*60_000,keys:Array.isArray(b.keys)?b.keys:[]};
  return jwksCache.keys;
}
function b64url(s:string){return Buffer.from(s,'base64url');}
function decodeJwt(token:string){
  const p=token.split('.'); if(p.length!==3) throw new Error('INVALID_JWT');
  return {h:JSON.parse(b64url(p[0]).toString()),p:JSON.parse(b64url(p[1]).toString()),s:p[2]};
}
async function verifyJwt(token:string):Promise<any>{
  const x=decodeJwt(token);
  if(x.h.alg!=='RS256') throw new Error('JWT_ALG_NOT_ALLOWED');
  let keys=await getJwks(config.auth.jwksUrl);
  const matches=(k:Jwk)=>k.kid===x.h.kid && k.kty==='RSA' && (!k.use || k.use==='sig') && (!k.alg || k.alg==='RS256');
  let jwk=keys.find(matches);
  if(!jwk){ keys=await getJwks(config.auth.jwksUrl,true); jwk=keys.find(matches); }
  if(!jwk) throw new Error('JWT_KEY_NOT_FOUND');
  const key=crypto.createPublicKey({key:jwk as any,format:'jwk'});
  const ok=crypto.verify('RSA-SHA256',Buffer.from(token.split('.').slice(0,2).join('.')),key,b64url(x.s));
  if(!ok) throw new Error('JWT_SIGNATURE_INVALID');
  if(typeof x.p.exp!=='number'||x.p.exp<=Math.floor(Date.now()/1000)) throw new Error('JWT_EXPIRED');
  if(typeof x.p.sub!=='string'||!x.p.sub.trim()) throw new Error('JWT_SUBJECT_REQUIRED');
  if(x.p.nbf!==undefined && (typeof x.p.nbf!=='number'||x.p.nbf>Math.floor(Date.now()/1000))) throw new Error('JWT_NOT_YET_VALID');
  if(config.auth.issuer && x.p.iss!==config.auth.issuer) throw new Error('JWT_ISSUER_INVALID');
  const aud=x.p.aud; const validAud=!config.auth.audience || (Array.isArray(aud)?aud.includes(config.auth.audience):aud===config.auth.audience);
  if(!validAud) throw new Error('JWT_AUDIENCE_INVALID');
  return x.p;
}

export async function authenticate(req:FastifyRequest):Promise<User>{
  if((req as any).lfUser) return (req as any).lfUser;
  const h=String(req.headers.authorization??'');
  if(!h.startsWith('Bearer ')) throw new Error('UNAUTHENTICATED');
  const p=await verifyJwt(h.slice(7));
  const driverId=p.sub;
  return {sub:String(p.sub),driverId};
}

export class RedisRateLimiter{
  private redis?:Redis;
  constructor(){if(config.redisUrl){this.redis=new Redis(config.redisUrl,{lazyConnect:true,maxRetriesPerRequest:1,retryStrategy:()=>null});this.redis.on('error',()=>{});}}
  close(){this.redis?.disconnect();}
  async allow(key:string,limit:number,windowSec:number){
    if(!this.redis) return true;
    const bucket=`lf:rl:${key}:${Math.floor(Date.now()/1000/windowSec)}`;
    const n=await this.redis.incr(bucket); if(n===1) await this.redis.expire(bucket,windowSec+2); return n<=limit;
  }
}

export class PgRepo{
  pool:Pool;
  constructor(){this.pool=new Pool({connectionString:config.databaseUrl});}
  async ping(){const r=await this.pool.query('select 1 as ok');return r.rows[0];}
  async ensureDriver(subject:string){
    const existing=await this.pool.query(`select id from drivers where external_subject=$1`,[subject]);
    if(existing.rowCount) return existing.rows[0].id as string;
    const id=crypto.randomUUID();
    const inserted=await this.pool.query(`insert into drivers(id,external_subject) values($1,$2) on conflict(external_subject) do update set external_subject=excluded.external_subject returning id`,[id,subject]);
    return inserted.rows[0].id as string;
  }
  async savePosition(subject:string,lat:number,lon:number,accuracy?:number){
    const driverId=await this.ensureDriver(subject);
    await this.pool.query(`insert into driver_locations(user_id,position,captured_at) values($1,ST_SetSRID(ST_MakePoint($3,$2),4326)::geography,now())`,[driverId,lat,lon]);
  }
  async audit(actor:string,action:string,entity:string,requestId?:string,meta?:unknown){
    const driverId=await this.ensureDriver(actor);
    await this.pool.query(`insert into audit_events(driver_id,action,external_id,idempotency_key,payload) values($1,$2,$3,$4,$5) on conflict(idempotency_key) do nothing`,[driverId,action,entity,requestId??null,meta?JSON.stringify(meta):null]);
  }
}

export function registerV13(app:FastifyInstance){
  const repo=config.databaseUrl?new PgRepo():undefined;
  const limiter=new RedisRateLimiter();
  app.addHook('onClose',async()=>{limiter.close();await repo?.pool.end();});
  app.decorateRequest('lfUser',null);
  app.addHook('onRequest',async(req,reply)=>{
    const path=req.url.split('?')[0];
    if(req.method==='GET' && (path==='/health'||path==='/v1/exchanges/trans-eu/callback')) return;
    try{(req as any).lfUser=await authenticate(req)}catch(e){return reply.code(401).send({error:'unauthenticated'})}
  });
  app.addHook('preHandler',async(req,reply)=>{
    if(!(req as any).lfUser)return;
    const u=(req as any).lfUser as User;
    if(!(await limiter.allow(`${u.driverId}:${req.routeOptions.url??req.url}`,60,60))) return reply.code(429).send({error:'rate_limited'});
  });
  app.get('/v13/health/deep',async()=>{
    const checks:any={auth:{ok:!!config.auth.jwksUrl},postgres:{ok:!!repo},redis:{ok:!!config.redisUrl}};
    if(repo){try{checks.postgres={ok:true,details:await repo.ping()}}catch(e){checks.postgres={ok:false,details:String(e)}}}
    return {ok:Object.values(checks).every((x:any)=>x.ok),checks};
  });
  app.post<{Body:{lat:number;lon:number;accuracy?:number}}>( '/v13/driver/location',async(req,reply)=>{
    const u=(req as any).lfUser as User; const b=req.body;
    if(!Number.isFinite(b.lat)||!Number.isFinite(b.lon)||Math.abs(b.lat)>90||Math.abs(b.lon)>180)return reply.code(400).send({error:'invalid_location'});
    if(!repo) return reply.code(503).send({error:'database_required'});
    await repo.savePosition(u.driverId,b.lat,b.lon,b.accuracy);
    return {ok:true,driverId:u.driverId};
  });
  app.post<{Body:{token:string;platform?:string}}>( '/v13/push-token',async(req,reply)=>{
    const u=(req as any).lfUser as User;
    if(!req.body?.token) return reply.code(400).send({error:'token_required'});
    if(!repo) return reply.code(503).send({error:'database_required'});
    const id=await repo.ensureDriver(u.driverId);
    await repo.pool.query(`insert into push_tokens(driver_id,token,platform) values($1,$2,$3) on conflict(driver_id,token) do update set last_seen_at=now()`,[id,req.body.token,req.body.platform??'android']);
    return {ok:true,driverId:u.driverId,platform:req.body.platform??'android'};
  });
  app.post<{Body:{action:string;entityId:string;idempotencyKey?:string;metadata?:unknown}}>( '/v13/audit',async(req,reply)=>{
    const u=(req as any).lfUser as User; if(!repo)return reply.code(503).send({error:'database_required'});
    await repo.audit(u.sub,req.body.action,req.body.entityId,req.body.idempotencyKey,req.body.metadata); return {ok:true};
  });
}
