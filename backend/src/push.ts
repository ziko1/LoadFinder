export type PushPayload = {
  title:string;
  body:string;
  loadId:string;
  deepLink:string;
};

export interface PushGateway {
  send(driverId:string,payload:PushPayload):Promise<void>;
}

export class LogPushGateway implements PushGateway {
  async send(driverId:string,payload:PushPayload) {
    console.log("PUSH",driverId,payload);
  }
}
