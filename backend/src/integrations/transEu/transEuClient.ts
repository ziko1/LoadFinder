import { config } from "../../config";

export type TransEuProposal = {
  id: string;
  freightPublicationId?: number;
  offerId?: string;
  price?: { value: number; currency: string };
  price_type?: string;
  stage?: string;
  status?: string;
  version: number;
  is_first_buy?: boolean;
  decision_date?: string | null;
  raw: unknown;
};

export interface AccessTokenStore {
  get(driverId: string): Promise<string | null>;
  set(driverId: string, token: string, expiresAt?: number, refreshToken?: string): Promise<void>;
  getRefreshToken?(driverId: string): Promise<string | null>;
  setRefreshToken?(driverId: string, refreshToken: string): Promise<void>;
}

/** Demo store only. Replace with KMS/encrypted DB/secret manager in production. */
export class MemoryAccessTokenStore implements AccessTokenStore {
  private readonly data = new Map<string, { token: string; expiresAt?: number }>();

  async get(driverId: string) {
    const item = this.data.get(driverId);
    if (!item) return null;
    if (item.expiresAt && Date.now() >= item.expiresAt) {
      this.data.delete(driverId);
      return null;
    }
    return item.token;
  }

  async set(driverId: string, token: string, expiresAt?: number, refreshToken?: string) {
    this.data.set(driverId, { token, expiresAt });
    if (refreshToken) (this as any).refreshTokens ??= new Map();
    if (refreshToken) (this as any).refreshTokens.set(driverId, refreshToken);
  }

  async getRefreshToken(driverId: string) {
    return ((this as any).refreshTokens?.get(driverId) ?? null) as string | null;
  }

  async setRefreshToken(driverId: string, refreshToken: string) {
    (this as any).refreshTokens ??= new Map();
    (this as any).refreshTokens.set(driverId, refreshToken);
  }
}

export class TransEuClient {
  constructor(
    private readonly tokens: AccessTokenStore,
    private readonly baseUrl = "https://api.platform.trans.eu",
  ) {}

  private async refreshAccessToken(driverId: string): Promise<string | null> {
    const refreshToken = await this.tokens.getRefreshToken?.(driverId);
    if (!refreshToken) return null;

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: config.TRANS_EU_CLIENT_ID,
      client_secret: config.TRANS_EU_CLIENT_SECRET
    });

    const response = await fetch("https://api.platform.trans.eu/ext/auth-api/accounts/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Api-key": config.TRANS_EU_API_KEY
      },
      body
    });
    if (!response.ok) return null;

    const token: any = await response.json();
    if (!token?.access_token) return null;

    const expiresAt = token.expires_in
      ? Date.now() + Number(token.expires_in) * 1000
      : undefined;
    await this.tokens.set(driverId, String(token.access_token), expiresAt, token.refresh_token);
    return String(token.access_token);
  }

  private async request(driverId: string, path: string, init: RequestInit = {}) {
    let token = await this.tokens.get(driverId);
    if (!token) token = await this.refreshAccessToken(driverId);
    if (!token) throw new Error("TRANS_EU_NOT_CONNECTED");

    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("Api-key", config.TRANS_EU_API_KEY);
    headers.set("Accept", "application/json");
    headers.set("Content-Type", "application/json");

    let res = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
    if (res.status === 401) {
      const refreshed = await this.refreshAccessToken(driverId);
      if (refreshed) {
        headers.set("Authorization", `Bearer ${refreshed}`);
        res = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
      }
    }
    const bodyText = await res.text();
    let body: unknown = null;
    try { body = bodyText ? JSON.parse(bodyText) : null; } catch { body = bodyText; }

    if (!res.ok) {
      const err = new Error(`TRANS_EU_HTTP_${res.status}`);
      (err as any).status = res.status;
      (err as any).body = body;
      throw err;
    }
    return body;
  }

  async getFreightProposals(driverId: string, page = 1, sortBy: "loading_date" | "unloading_date" = "loading_date", order: "asc" | "desc" = "asc"): Promise<unknown[]> {
    if (!Number.isInteger(page) || page < 1 || page > 10000) {
      throw new Error("INVALID_TRANS_EU_PAGE");
    }
    const qs = new URLSearchParams({
      page: String(page),
      sortBy,
      order
    });
    const raw = await this.request(
      driverId,
      `/ext/freights-api/v2/freight-proposals?${qs.toString()}`
    );
    if (!Array.isArray(raw)) {
      throw new Error("TRANS_EU_INVALID_PROPOSAL_LIST");
    }
    return raw;
  }

  async getProposalDetails(driverId: string, freightId: string): Promise<TransEuProposal> {
    const raw: any = await this.request(
      driverId,
      `/ext/freights-api/v2/freight-proposals/${encodeURIComponent(freightId)}`
    );

    return {
      id: String(raw?.id ?? freightId),
      freightPublicationId: raw?.freight_publication_id,
      offerId: raw?.id ? String(raw.id) : undefined,
      price: raw?.price ? {
        value: Number(raw.price.value),
        currency: String(raw.price.currency ?? "eur")
      } : undefined,
      price_type: raw?.price_type,
      stage: raw?.stage,
      status: raw?.status,
      version: Number(raw?.version ?? 1),
      is_first_buy: Boolean(raw?.is_first_buy),
      decision_date: raw?.decision_date ?? null,
      raw
    };
  }

  async negotiate(driverId: string, offerId: string, amount: number, currency="eur", version?: number) {
    const payload: any = {
      payment: { price: { value: amount, currency }, type: "route" }
    };
    if (version != null) payload.version = version;

    return this.request(
      driverId,
      `/ext/freights-api/v1/freights/offers/${encodeURIComponent(offerId)}/negotiate`,
      { method: "PATCH", body: JSON.stringify(payload) }
    );
  }

  async accept(driverId: string, offerId: string, version: number, targetEmployeeId?: string) {
    const payload: any = { version };
    if (targetEmployeeId) payload.target_employee_id = targetEmployeeId;

    return this.request(
      driverId,
      `/ext/freights-api/v1/freights/offers/${encodeURIComponent(offerId)}/accept`,
      { method: "POST", body: JSON.stringify(payload) }
    );
  }

  async getAccepted(driverId: string) {
    return this.request(driverId, "/ext/freights-api/v1/freight-proposals/accepted");
  }
}
