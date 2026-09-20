export type PushToken={driverId:string;token:string;platform:"android"};
export class PushTokenStore{
 private tokens=new Map<string,PushToken>();
 set(x:PushToken){this.tokens.set(x.driverId,x)}
 get(driverId:string){return this.tokens.get(driverId)}
}
export interface PushSender{send(token:string,title:string,body:string,data?:Record<string,string>):Promise<void>}
export class FirebasePushSender implements PushSender{
 async send(token:string,title:string,body:string,data?:Record<string,string>){
  // Wire Firebase Admin SDK here after service-account configuration.
  console.log(JSON.stringify({token,title,body,data}))
 }
}
