import { ExchangeAdapter } from "./ExchangeAdapter";
import { Load, SearchParams } from "../types";
import { config } from "../config";

/**
 * Trans.eu OAuth/API adapter boundary.
 *
 * The exact freight query/body fields should be mapped from the current
 * official Trans.eu API schema. Never put client_secret in Android.
 */
export class TransEuAdapter implements ExchangeAdapter {
  name = "TRANS_EU";

  authorizationUrl(state: string) {
    const u = new URL("https://auth.platform.trans.eu/oauth2/auth");
    u.searchParams.set("client_id", config.transEu.clientId);
    u.searchParams.set("response_type", "code");
    u.searchParams.set("state", state);
    u.searchParams.set("redirect_uri", config.transEu.redirectUri);
    return u.toString();
  }

  async exchangeCodeForToken(code: string): Promise<unknown> {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.transEu.redirectUri,
      client_id: config.transEu.clientId,
      client_secret: config.transEu.clientSecret
    });
    const r = await fetch("https://api.platform.trans.eu/ext/auth-api/accounts/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Api-key": config.transEu.apiKey
      },
      body
    });
    if (!r.ok) throw new Error(`Trans.eu token exchange failed: ${r.status}`);
    return r.json();
  }

  async searchLoads(_p: SearchParams): Promise<Load[]> {
    // TODO: map the current official freight-list endpoint once the
    // application's approved API scope is provisioned.
    return [];
  }

  async getLoadDetails(_id: string): Promise<Load | null> { return null; }

  async submitOffer(_id: string, _amountEur: number): Promise<{offerId:string}> {
    throw new Error("Trans.eu offer operation requires the approved API scope and current endpoint mapping.");
  }

  async acceptLoad(_id: string): Promise<{bookingId:string}> {
    throw new Error("Trans.eu acceptance operation requires the approved API scope and current endpoint mapping.");
  }
}
