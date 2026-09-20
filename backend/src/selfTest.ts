import { strict as assert } from "node:assert";
import { distanceKm, detectArrival } from "./geofenceEngine";
const a={lat:52.52,lon:13.405};
const b={lat:52.52,lon:13.405};
assert(distanceKm(a,b) < 0.001);
assert.equal(detectArrival(a,b,250),true);
assert.equal(detectArrival(a,{lat:52.60,lon:13.405},250),false);
console.log("LoadFinder backend self-test: OK");
