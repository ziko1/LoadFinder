export type OutboxEvent={key:string,payload:unknown,attempts:number};
export class NotificationOutbox {
  readonly events:OutboxEvent[]=[];
  add(key:string,payload:unknown){this.events.push({key,payload,attempts:0});}
  retry(key:string){const e=this.events.find(x=>x.key===key); if(e)e.attempts++;}
}
