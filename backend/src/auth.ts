import crypto from "node:crypto";

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Development authentication placeholder.
 * Production: replace with OIDC/JWT verification and tenant/driver authorization.
 */
export function requireDriver(req: any) {
  const auth = req.headers.authorization as string | undefined;
  if (!auth?.startsWith("Bearer ")) throw new Error("Unauthorized");
  return auth.slice(7);
}
