import { describe, expect, it } from 'vitest';
import { NotificationOutbox } from './testkit/notificationOutbox';

describe('notification outbox',()=>{
  it('increments retry attempts without duplicating the event',()=>{
    const o=new NotificationOutbox();
    o.add('load:1',{loadId:'1'});
    o.retry('load:1');
    o.retry('load:1');
    expect(o.events).toHaveLength(1);
    expect(o.events[0].attempts).toBe(2);
  });
});
