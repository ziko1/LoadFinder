export class InMemoryQueue {
  private items:string[]=[];
  push(item:string){this.items.push(item);}
  pop(){return this.items.shift() ?? null;}
  size(){return this.items.length;}
}
