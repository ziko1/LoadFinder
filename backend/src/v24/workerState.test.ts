import { describe, expect, it } from 'vitest';
import { transition } from '../v23/workerState';

describe('worker state',()=>{
  it('allows idle to running',()=>expect(transition('idle','running')).toBe('running'));
  it('rejects running to idle? no, this is valid',()=>expect(transition('running','idle')).toBe('idle'));
  it('rejects stopped to failed',()=>expect(()=>transition('stopped','failed')).toThrow());
});
