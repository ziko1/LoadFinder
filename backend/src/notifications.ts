export type NotificationEvent =
  | { type:"BEST_LOAD"; loadId:string; title:string; body:string }
  | { type:"BID_STATUS"; loadId:string; title:string; body:string };

export interface NotificationGateway {
  send(driverId:string, event:NotificationEvent): Promise<void>;
}

export class LogNotificationGateway implements NotificationGateway {
  async send(driverId:string, event:NotificationEvent) {
    console.log("[NOTIFICATION]", driverId, event);
  }
}
