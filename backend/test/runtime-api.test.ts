import {afterEach,beforeAll,describe,expect,it,vi} from 'vitest';
import crypto from 'node:crypto';
import {buildApp} from '../src/server';
import {config} from '../src/config';
import type {FastifyInstance} from 'fastify';

const pair=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
const jwk={...pair.publicKey.export({format:'jwk'}),kid:'runtime-test',alg:'RS256',use:'sig'};
const apps:FastifyInstance[]=[];
function token(sub='alice',extra:Record<string,unknown>={}){
  const enc=(v:unknown)=>Buffer.from(JSON.stringify(v)).toString('base64url');
  const body=enc({alg:'RS256',kid:jwk.kid})+'.'+enc({sub,iss:'https://identity.test',aud:'loadfinder',exp:Math.floor(Date.now()/1000)+600,...extra});
  return body+'.'+crypto.sign('RSA-SHA256',Buffer.from(body),pair.privateKey).toString('base64url');
}
const headers=(sub='alice')=>({authorization:'Bearer '+token(sub)});
const sample={provider:'trans.eu' as const,externalId:'42',pickup:{lat:52.01,lon:13},delivery:{lat:53,lon:14},priceEur:600,distanceKm:200,vehicleCompatible:true,raw:{loadfinder:{pickupCity:'Berlin',deliveryCity:'Szczecin',vehicleType:'VAN',weightKg:1200}}};
function app(fail=false){
  vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({keys:[jwk]}),{status:200})));
  const a=buildApp({logger:false,providers:[{name:'trans.eu',search:async()=>{if(fail)throw new Error('private_provider_failure');return [sample];}}]});
  apps.push(a);return a;
}
beforeAll(()=>{
  config.databaseUrl='';config.redisUrl='';config.auth={jwksUrl:'https://identity.test/jwks',issuer:'https://identity.test',audience:'loadfinder'};
});
afterEach(async()=>{await Promise.all(apps.splice(0).map(a=>a.close()));vi.unstubAllGlobals();});

describe('authenticated runtime API',()=>{
  it('serves Android fields, metadata and actual pickup distance',async()=>{
    const r=await app().inject({url:'/v1/loads/page?lat=52&lon=13&vehicleType=VAN',headers:headers()});
    expect(r.statusCode).toBe(200);
    const load=r.json().items[0];
    expect(load).toMatchObject({id:'trans.eu:42',pickupLat:52.01,pickupLon:13,deliveryLat:53,deliveryLon:14,pickupCity:'Berlin',weightKg:1200});
    expect(load.pickupDistanceKm).toBeGreaterThan(1);
    expect(load.emptyDistanceKm).toBe(load.pickupDistanceKm);
  });
  it.each(['minPriceEur=601','destination=Paris','vehicleType=BOX','maxEmptyKm=0'])('applies %s',async(filter)=>{
    const r=await app().inject({url:'/v1/loads/page?lat=52&lon=13&'+filter,headers:headers()});
    expect(r.statusCode).toBe(200);expect(r.json().total).toBe(0);
  });
  it('reports provider outages rather than empty success',async()=>{
    const r=await app(true).inject({url:'/v1/loads/page?lat=52&lon=13',headers:headers()});
    expect(r.statusCode).toBe(503);expect(r.json().error).toBe('EXCHANGE_UNAVAILABLE');
  });
  it.each(['minPriceEur=no','minMatchScore=101','lat=91','page=NaN'])('rejects malformed %s',async(query)=>{
    const r=await app().inject({url:'/v1/loads/page?lon=13&lat=52&'+query,headers:headers()});
    expect(r.statusCode).toBe(400);
  });
  it('isolates route reads and writes between users',async()=>{
    const a=app();const route={driverId:'alice',loadId:'trans.eu:42',pickup:sample.pickup,delivery:sample.delivery,status:'TO_PICKUP'};
    expect((await a.inject({method:'POST',url:'/v1/driver/route',headers:headers(),payload:route})).statusCode).toBe(200);
    expect((await a.inject({url:'/v1/driver/route/alice',headers:headers('bob')})).statusCode).toBe(403);
    expect((await a.inject({method:'POST',url:'/v1/driver/route',headers:headers('bob'),payload:route})).statusCode).toBe(403);
    expect((await a.inject({method:'POST',url:'/v1/driver/route/position',headers:headers('bob'),payload:{driverId:'alice',...sample.pickup}})).statusCode).toBe(403);
    expect((await a.inject({url:'/v1/driver/route/alice',headers:headers()})).json().status).toBe('TO_PICKUP');
  });
  it.each(['/v1/webhooks/trans-eu/events','/health/secret','/v1/exchanges/trans-eu/callback/secret'])('does not bypass authentication for %s',async(url)=>{
    expect((await app().inject({url})).statusCode).toBe(401);
  });
  it('rejects unsigned webhook ingestion',async()=>{
    expect((await app().inject({url:'/v1/webhooks/trans-eu',method:'POST',payload:{event:'fake'}})).statusCode).toBe(401);
  });
  it.each([{exp:1},{nbf:9999999999},{aud:'other'},{iss:'other'},{sub:''}])('rejects invalid JWT claims %j',async(extra)=>{
    expect((await app().inject({url:'/v1/loads?lat=52&lon=13',headers:{authorization:'Bearer '+token('alice',extra)}})).statusCode).toBe(401);
  });
});
