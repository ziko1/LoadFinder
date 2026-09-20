import crypto from "node:crypto";

const states = new Map<string, number>();

export function createState() {
  const state = crypto.randomBytes(24).toString("hex");
  states.set(state, Date.now() + 10 * 60_000);
  return state;
}

export function consumeState(state: string) {
  const expiry = states.get(state);
  states.delete(state);
  return !!expiry && expiry > Date.now();
}
