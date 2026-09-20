export type TestLoad={id:string,driverId:string,score:number};
export class InMemoryLoadRepo {
  readonly loads:TestLoad[]=[];
  save(load:TestLoad){this.loads.push(load);}
  forDriver(driverId:string){return this.loads.filter(x=>x.driverId===driverId);}
}
