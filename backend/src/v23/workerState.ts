export type WorkerState = 'idle' | 'running' | 'stopped' | 'failed';

export function transition(from: WorkerState, to: WorkerState) {
  const allowed: Record<WorkerState, WorkerState[]> = {
    idle: ['running','stopped'],
    running: ['idle','failed','stopped'],
    stopped: ['idle'],
    failed: ['idle','stopped']
  };
  if (!allowed[from].includes(to)) throw new Error(`invalid transition ${from}->${to}`);
  return to;
}
