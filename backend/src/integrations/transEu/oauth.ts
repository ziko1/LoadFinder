import crypto from "node:crypto";
import { config } from "../../config";
import type { AccessTokenStore } from "./transEuClient";
import {pool} from '../../db';

const states = new Map<string, { driverId: string; expiresAt: number }>();

export async function createTransEuAuthorizationUrl(driverId: string) {
  if(!config.TRANS_EU_CLIENT_ID || !config.TRANS_EU_CLIENT_SECRET || !config.TRANS_EU_API_KEY) throw Object.assign(new Error('TRANS_EU_NOT_CONFIGURED'),{statusCode:503});
  const state = crypto.randomBytes(24).toString("hex");
  if(config.databaseUrl){
    await pool.query('delete from oauth_states where expires_at < now()');
    await pool.query("insert into oauth_states(state_hash,subject,expires_at) values($1,$2,now()+interval '10 minutes')",[crypto.createHash('sha256').update(state).digest('hex'),driverId]);
  }else{
    for(const [key,item] of states) if(item.expiresAt<Date.now()) states.delete(key);
    states.set(state, { driverId, expiresAt: Date.now() + 10 * 60_000 });
  }

  const url = new URL("https://auth.platform.trans.eu/oauth2/auth");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.TRANS_EU_CLIENT_ID);
  url.searchParams.set("redirect_uri", config.TRANS_EU_REDIRECT_URI);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function handleTransEuCallback(
  code: string,
  state: string,
  tokens: AccessTokenStore
) {
  let item = states.get(state);
  states.delete(state);
  if(config.databaseUrl){
    const r=await pool.query('delete from oauth_states where state_hash=$1 returning subject,expires_at',[crypto.createHash('sha256').update(state).digest('hex')]);
    item=r.rowCount?{driverId:r.rows[0].subject,expiresAt:new Date(r.rows[0].expires_at).getTime()}:undefined;
  }
  if (!item || item.expiresAt < Date.now()) throw new Error("INVALID_OAUTH_STATE");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: config.TRANS_EU_CLIENT_ID,
    client_secret: config.TRANS_EU_CLIENT_SECRET,
    redirect_uri: config.TRANS_EU_REDIRECT_URI,
  });

  const response = await fetch("https://api.platform.trans.eu/ext/auth-api/accounts/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Api-key":config.TRANS_EU_API_KEY },
    signal:AbortSignal.timeout(15000),
    body
  });
  if (!response.ok) throw new Error(`TRANS_EU_TOKEN_HTTP_${response.status}`);

  const token: any = await response.json();
  if(typeof token.access_token!=='string'||!token.access_token||!(Number(token.expires_in)>0)) throw new Error('INVALID_TOKEN_RESPONSE');
  await tokens.set(
    item.driverId,
    token.access_token,
    token.expires_in ? Date.now() + Number(token.expires_in) * 1000 : undefined,
    token.refresh_token
  );

  return { driverId: item.driverId };
}
