export type PushMessage = {
  driverId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

export interface PushGateway {
  send(message: PushMessage): Promise<void>;
}

/**
 * Provider-neutral gateway. Replace with Firebase Admin SDK or another
 * push provider once the production project credentials are configured.
 */
export class LogPushGateway implements PushGateway {
  async send(message: PushMessage) {
    console.log("[PUSH]", JSON.stringify(message));
  }
}
