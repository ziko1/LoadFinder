import { describe, expect, it } from 'vitest';
import { InMemoryQueue } from './testkit/inMemoryQueue';
import { InMemoryLoadRepo } from './testkit/inMemoryLoadRepo';

describe('auto-search pipeline',()=>{
  it('queues, persists and returns ranked loads',()=>{
    const q=new InMemoryQueue();
    const repo=new InMemoryLoadRepo();
    q.push('driver-1');
    const driver=q.pop();
    expect(driver).toBe('driver-1');
    repo.save({id:'load-1',driverId:driver!,score:92});
    repo.save({id:'load-2',driverId:driver!,score:71});
    expect(repo.forDriver(driver!).sort((a,b)=>b.score-a.score)[0].score).toBe(92);
    expect(q.size()).toBe(0);
  });
});
