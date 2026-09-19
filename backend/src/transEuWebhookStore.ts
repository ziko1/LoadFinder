export type ExchangeEvent = {
  provider: "trans.eu";
  id: string;
  eventName: string;
  occurredAt: string;
  data?: unknown;
};

export class TransEuWebhookStore {
  private readonly events = new Map<string, ExchangeEvent>();

  add(event: ExchangeEvent) {
    if (this.events.has(event.id)) return false;
    this.events.set(event.id, event);
    return true;
  }

  all() {
    return [...this.events.values()];
  }
}
