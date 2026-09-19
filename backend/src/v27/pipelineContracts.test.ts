import {describe,it,expect} from 'vitest';
import {rankCandidates,selectNotified} from './pipelineContracts';

describe('v27 pipeline contracts',()=>{
  it('ranks by score then profit',()=>{
    const r=rankCandidates([
      {id:'a',score:80,profitEur:500},
      {id:'b',score:90,profitEur:100},
      {id:'c',score:90,profitEur:200},
    ]);
    expect(r.map(x=>x.id)).toEqual(['c','b','a']);
  });
  it('limits notifications',()=>{
    expect(selectNotified([{id:'a',score:90,profitEur:1},{id:'b',score:80,profitEur:2}],1)).toHaveLength(1);
  });
});
