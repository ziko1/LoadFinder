import crypto from "node:crypto";
import { config } from "../../config";
import type { AccessTokenStore } from "./transEuClient";

const states = new Map<string, { driverId: string; expiresAt: number }>();

export function createTransEuAuthorizationUrl(driverId: string) {
  const state = crypto.randomBytes(24).toString("hex");
  states.set(state, { driverId, expiresAt: Date.now() + 10 * 60_000 });

  const url = new URL("https://auth.platform.trans.eu/oauth2/authorize");
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
  const item = states.get(state);
  states.delete(state);
  if (!item || item.expiresAt < Date.now()) throw new Error("INVALID_OAUTH_STATE");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: config.TRANS_EU_CLIENT_ID,
    client_secret: config.TRANS_EU_CLIENT_SECRET,
    redirect_uri: config.TRANS_EU_REDIRECT_URI,
  });

  const response = await fetch("https://auth.platform.trans.eu/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!response.ok) throw new Error(`TRANS_EU_TOKEN_HTTP_${response.status}`);

  const token: any = await response.json();
  await tokens.set(
    item.driverId,
    token.access_token,
    token.expires_in ? Date.now() + Number(token.expires_in) * 1000 : undefined,
    token.refresh_token
  );

  return { driverId: item.driverId };
}
