import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getMessaging} from 'firebase-admin/messaging';
import type {Pool} from 'pg';
import type {PushGateway,PushPayload} from './push';

export class FirebasePushGateway implements PushGateway {
  constructor(private readonly pool:Pool){}
  async send(driverId:string,payload:PushPayload){
    if(process.env.PUSH_PROVIDER!=='firebase') throw new Error('PUSH_NOT_CONFIGURED');
    if(!getApps().length)initializeApp({credential:applicationDefault()});
    const rows=await this.pool.query('select token from push_tokens where driver_id=$1 and platform=$2',[driverId,'android']);
    const tokens=rows.rows.map(r=>String(r.token));
    if(!tokens.length) throw new Error('NO_PUSH_TOKENS');
    let successes=0;
    for(let start=0;start<tokens.length;start+=500){
      const batch=tokens.slice(start,start+500);
      const result=await getMessaging().sendEachForMulticast({tokens:batch,data:{...payload},android:{priority:'high',ttl:900000}});
      successes+=result.successCount;
      for(let i=0;i<result.responses.length;i++){
        if(result.responses[i].error?.code==='messaging/registration-token-not-registered'){
          await this.pool.query('delete from push_tokens where driver_id=$1 and token=$2',[driverId,batch[i]]);
        }
      }
    }
    if(!successes)throw new Error('PUSH_DELIVERY_FAILED');
  }
}
