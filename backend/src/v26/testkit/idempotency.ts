export class Idempotency {
  private seen=new Set<string>();
  accept(key:string){if(this.seen.has(key)) return false; this.seen.add(key); return true;}
}
