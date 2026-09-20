import {afterAll,beforeAll,describe,expect,it,vi} from 'vitest';
import {Pool} from 'pg';
import {config} from '../src/config';
import {PgRepo} from '../src/v13';
import {EncryptedTokenStore} from '../src/v14';
import {V14Persistence} from '../src/v14Persistence';
import {ReliableLoadNotificationService} from '../src/v17/notificationService';
import {SearchQueue} from '../src/v15/redisQueue';

describe.skipIf(!process.env.INTEGRATION_DATABASE_URL)('PostGIS and Redis integration',()=>{
  let repo:PgRepo;
  let tokens:EncryptedTokenStore;
  let persistence:V14Persistence;
  let queue:SearchQueue;
  let driverId:string;
  const subject='integration-'+Date.now();
  beforeAll(async()=>{
    config.databaseUrl=process.env.INTEGRATION_DATABASE_URL!;
    repo=new PgRepo();tokens=new EncryptedTokenStore('integration-key-not-production');
    persistence=new V14Persistence();queue=new SearchQueue(process.env.INTEGRATION_REDIS_URL);
    driverId=await repo.ensureDriver(subject);
  });
  afterAll(async()=>{
    if(repo){await repo.pool.query('delete from drivers where id=$1',[driverId]);await repo.pool.end();}
    await tokens?.close();await persistence?.pool.end();await queue?.close();
  });
  it('persists positions, refresh tokens and device tokens in the migrated schema',async()=>{
    await repo.savePosition(subject,52,13);
    await tokens.set(subject,'access',Date.now()+60000,'refresh');
    expect(await tokens.get(subject)).toBe('access');
    expect(await tokens.getRefreshToken(subject)).toBe('refresh');
    await persistence.savePushToken(subject,'integration-device-token');
    const r=await repo.pool.query('select ST_Y(position::geometry) lat from driver_locations where user_id=$1',[driverId]);
    expect(r.rows[0].lat).toBe(52);
    const encrypted=await repo.pool.query('select access_token_enc from trans_eu_connections where driver_id=$1',[driverId]);
    expect(encrypted.rows[0].access_token_enc).not.toBe('access');
  });
  it('retries failed pushes and never marks a failed delivery as sent',async()=>{
    const send=vi.fn().mockRejectedValueOnce(new Error('unavailable')).mockResolvedValue(undefined);
    const service=new ReliableLoadNotificationService(repo.pool,{send});
    const load={provider:'trans.eu' as const,externalId:'integration',pickup:{lat:52,lon:13},delivery:{lat:53,lon:14},priceEur:500,distanceKm:200,vehicleCompatible:true,raw:{}};
    expect(await service.notifyNewMatches(driverId,[load])).toBe(0);
    expect(await service.notifyNewMatches(driverId,[load])).toBe(1);
    expect(await service.notifyNewMatches(driverId,[load])).toBe(0);
    expect(send).toHaveBeenCalledTimes(2);
    const r=await repo.pool.query('select attempts,sent_at,error from load_notifications where driver_id=$1',[driverId]);
    expect(r.rows[0].attempts).toBe(2);expect(r.rows[0].sent_at).toBeTruthy();expect(r.rows[0].error).toBeNull();
  });
  it('round-trips a driver-scoped search job through Redis',async()=>{
    const job={driverExternalSubject:subject,lat:52,lon:13,radiusKm:100};
    await queue.enqueue(job);expect(await queue.dequeue(1)).toEqual(job);
  });
});
