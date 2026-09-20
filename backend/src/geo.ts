export function distanceKm(a:{lat:number,lon:number}, b:{lat:number,lon:number}) {
  const R=6371, dLat=(b.lat-a.lat)*Math.PI/180, dLon=(b.lon-a.lon)*Math.PI/180;
  const x=Math.sin(dLat/2)**2+
    Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;
  return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}