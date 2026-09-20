import {describe,it,expect} from 'vitest';
import {allServicesHealthy,requireTestServices} from './testkit/postgresRedisContract';
import {Idempotency} from './testkit/idempotency';

describe('v26 integration contracts',()=>{
  it('requires both PostgreSQL and Redis',()=>{
    expect(allServicesHealthy({postgres:true,redis:true})).toBe(true);
    expect(()=>requireTestServices({postgres:true,redis:false})).toThrow();
  });
  it('is idempotent',()=>{
    const x=new Idempotency();
    expect(x.accept('job-1')).toBe(true);
    expect(x.accept('job-1')).toBe(false);
  });
});
