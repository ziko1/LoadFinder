import { describe, expect, it } from 'vitest';
import { validatePolicy } from '../v23/autoSearchPolicy';

describe('validatePolicy',()=>{
  it('accepts valid policy',()=>{
    expect(validatePolicy({enabled:true,radiusKm:100,cooldownMs:60000,maxResults:50}).radiusKm).toBe(100);
  });
  it('rejects invalid radius',()=>{
    expect(()=>validatePolicy({enabled:true,radiusKm:0,cooldownMs:60000,maxResults:50})).toThrow();
  });
  it('rejects invalid result count',()=>{
    expect(()=>validatePolicy({enabled:true,radiusKm:100,cooldownMs:60000,maxResults:101})).toThrow();
  });
});
