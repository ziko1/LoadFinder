export type AuthUser={sub:string;driverId:string};
export function requireUser(req:any):AuthUser{
  const user=req.user as AuthUser|undefined;
  if(!user) throw new Error("UNAUTHENTICATED");
  return user;
}
/*
Production: validate JWT signature, issuer, audience and expiry with OIDC/JWKS.
Never trust driverId from request JSON when selecting a driver's data.
*/
