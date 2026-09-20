import {afterEach,describe,it,expect,vi} from 'vitest';
import {config} from '../src/config';
import {createTransEuAuthorizationUrl,handleTransEuCallback} from '../src/integrations/transEu/oauth';
import {MemoryAccessTokenStore} from '../src/integrations/transEu/transEuClient';

afterEach(()=>vi.unstubAllGlobals());
describe('Trans.eu OAuth lifecycle',()=>{
  it('exchanges a user-bound one-time code using the official token endpoint',async()=>{
    config.databaseUrl='';config.TRANS_EU_CLIENT_ID='test-client';config.TRANS_EU_CLIENT_SECRET='test-secret';config.TRANS_EU_API_KEY='test-api-key';
    const authorize=new URL(await createTransEuAuthorizationUrl('alice'));
    expect(authorize.origin+authorize.pathname).toBe('https://auth.platform.trans.eu/oauth2/auth');
    const state=authorize.searchParams.get('state')!;
    const fetcher=vi.fn(async()=>new Response(JSON.stringify({access_token:'test-access',refresh_token:'test-refresh',expires_in:300})));
    vi.stubGlobal('fetch',fetcher);
    const store=new MemoryAccessTokenStore();
    await handleTransEuCallback('test-code',state,store);
    expect(await store.get('alice')).toBe('test-access');
    expect(await store.get('bob')).toBeNull();
    expect(await store.getRefreshToken('alice')).toBe('test-refresh');
    const [url,request]=fetcher.mock.calls[0] as unknown as [string,RequestInit];
    expect(url).toBe('https://api.platform.trans.eu/ext/auth-api/accounts/token');
    expect(new Headers(request.headers).get('Api-key')).toBe('test-api-key');
    expect(new URLSearchParams(String(request.body)).get('grant_type')).toBe('authorization_code');
    await expect(handleTransEuCallback('test-code',state,store)).rejects.toThrow('INVALID_OAUTH_STATE');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('rejects an unsolicited callback without making a token request',async()=>{
    config.databaseUrl='';
    const fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);
    await expect(handleTransEuCallback('code','unissued-state',new MemoryAccessTokenStore())).rejects.toThrow('INVALID_OAUTH_STATE');
    expect(fetcher).not.toHaveBeenCalled();
  });
});
