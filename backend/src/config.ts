export const config = {
  PORT: Number(process.env.PORT ?? 8080),
  port: Number(process.env.PORT ?? 8080),
  databaseUrl: process.env.DATABASE_URL ?? "",
  redisUrl: process.env.REDIS_URL ?? "",
  auth: {
    jwksUrl: process.env.AUTH_JWKS_URL ?? "",
    issuer: process.env.AUTH_ISSUER ?? "",
    audience: process.env.AUTH_AUDIENCE ?? ""
  },
  TRANS_EU_CLIENT_ID: process.env.TRANS_EU_CLIENT_ID ?? "",
  TRANS_EU_CLIENT_SECRET: process.env.TRANS_EU_CLIENT_SECRET ?? "",
  TRANS_EU_API_KEY: process.env.TRANS_EU_API_KEY ?? "",
  TRANS_EU_REDIRECT_URI: process.env.TRANS_EU_REDIRECT_URI ?? "http://localhost:8080/v1/exchanges/trans-eu/callback",
  transEu: {
    clientId: process.env.TRANS_EU_CLIENT_ID ?? "",
    clientSecret: process.env.TRANS_EU_CLIENT_SECRET ?? "",
    apiKey: process.env.TRANS_EU_API_KEY ?? "",
    redirectUri: process.env.TRANS_EU_REDIRECT_URI ?? "http://localhost:8080/v1/exchanges/trans-eu/callback"
  }
};
