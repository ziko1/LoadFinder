import {afterEach,describe,expect,it,vi} from 'vitest';
import type {Pool} from 'pg';
const {send}=vi.hoisted(()=>({send:vi.fn()}));
vi.mock('firebase-admin/app',()=>({getApps:()=>[{}],applicationDefault:vi.fn(),initializeApp:vi.fn()}));
vi.mock('firebase-admin/messaging',()=>({getMessaging:()=>({sendEachForMulticast:send})}));
import {FirebasePushGateway} from '../src/firebasePush';
const payload={title:'New load',body:'Test route',loadId:'trans.eu:42',deepLink:'loadfinder://load/trans.eu/42'};
afterEach(()=>{vi.unstubAllEnvs();send.mockReset();});
describe('Firebase delivery',()=>{
  it('fails closed when delivery is not configured',async()=>{
    vi.stubEnv('PUSH_PROVIDER','disabled');
    const query=vi.fn();
    await expect(new FirebasePushGateway({query} as unknown as Pool).send('driver',payload)).rejects.toThrow('PUSH_NOT_CONFIGURED');
    expect(send).not.toHaveBeenCalled();
  });
  it('does not count a driver without a device as delivered',async()=>{
    vi.stubEnv('PUSH_PROVIDER','firebase');
    await expect(new FirebasePushGateway({query:async()=>({rows:[]})} as unknown as Pool).send('driver',payload)).rejects.toThrow('NO_PUSH_TOKENS');
  });
  it('includes the owning account in the payload',async()=>{
    vi.stubEnv('PUSH_PROVIDER','firebase');
    send.mockResolvedValue({successCount:1,responses:[{success:true}]});
    await new FirebasePushGateway({query:async()=>({rows:[{token:'device',external_subject:'alice'}]})} as unknown as Pool).send('driver',payload);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({tokens:['device'],data:expect.objectContaining({loadId:'trans.eu:42',recipient:'alice'})}));
  });
  it('removes expired registration tokens and reports failed delivery',async()=>{
    vi.stubEnv('PUSH_PROVIDER','firebase');
    const query=vi.fn().mockResolvedValueOnce({rows:[{token:'expired',external_subject:'alice'}]}).mockResolvedValue({rows:[]});
    send.mockResolvedValue({successCount:0,responses:[{error:{code:'messaging/registration-token-not-registered'}}]});
    await expect(new FirebasePushGateway({query} as unknown as Pool).send('driver',payload)).rejects.toThrow('PUSH_DELIVERY_FAILED');
    expect(query.mock.calls[1][1]).toEqual(['driver','expired']);
  });
});
