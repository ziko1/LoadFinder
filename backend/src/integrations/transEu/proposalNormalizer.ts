import { UnifiedLoad } from "../../v11/unifiedLoad";

type Geo = { lat: number; lon: number };

function firstTwoSpots(raw: any): [Geo | null, Geo | null] {
  const spots = Array.isArray(raw?.freight?.spots) ? raw.freight.spots : [];
  const points = spots.map((s: any) => s?.place?.coordinates)
    .filter((x: any) => Number.isFinite(Number(x?.latitude)) && Number.isFinite(Number(x?.longitude)));
  return [
    points[0] ? { lat: Number(points[0].latitude), lon: Number(points[0].longitude) } : null,
    points[1] ? { lat: Number(points[1].latitude), lon: Number(points[1].longitude) } : null
  ];
}

function normalizeVehicleType(raw: any): string {
  const bodies = Array.isArray(raw?.freight?.requirements?.required_truck_bodies)
    ? raw.freight.requirements.required_truck_bodies.map((x: any) => String(x).toLowerCase())
    : [];
  const joined = bodies.join(" ");
  if (/refriger|reefer|isotherm/.test(joined)) return "REFRIGERATED";
  if (/curtain|tautliner|curtainsider/.test(joined)) return "CURTAINSIDER";
  if (/box|closed/.test(joined)) return "BOX";
  if (/van|small/.test(joined) || String(raw?.freight?.requirements?.vehicle_size_id ?? "").toLowerCase() === "van") return "VAN";
  const size = String(raw?.freight?.requirements?.vehicle_size_id ?? "").toLowerCase();
  if (size === "solo") return "TRUCK";
  return "UNKNOWN";
}

function firstCity(raw: any, index: number): string {
  const spots = Array.isArray(raw?.freight?.spots) ? raw.freight.spots : [];
  return String(spots[index]?.place?.locality ?? spots[index]?.place?.city ?? "Unknown");
}

export function normalizeTransEuProposal(raw: any): UnifiedLoad | null {
  const [pickup, delivery] = firstTwoSpots(raw);
  const price = Number(raw?.publication?.price?.value ?? raw?.price?.value);
  const currency = String(raw?.publication?.price?.currency ?? raw?.price?.currency ?? "").toLowerCase();
  const distanceMeters = Number(raw?.freight?.distance);
  const externalId = String(raw?.id ?? raw?.freight?.id ?? "");
  if (!pickup || !delivery || !externalId) return null;
  if (currency !== "eur" || !Number.isFinite(price) || price <= 0) return null;

  const vehicleType = normalizeVehicleType(raw);
  const capacityTonnes = Number(raw?.freight?.capacity?.value);
  return {
    provider: "trans.eu",
    externalId,
    pickup,
    delivery,
    pickupTime: raw?.decision_date ?? undefined,
    priceEur: price,
    distanceKm: Number.isFinite(distanceMeters) && distanceMeters > 0
      ? distanceMeters / 1000
      : 0,
    vehicleCompatible: vehicleType !== "UNKNOWN",
    raw: {
      ...raw,
      loadfinder: {
        pickupCity: firstCity(raw, 0),
        deliveryCity: firstCity(raw, 1),
        vehicleType,
        weightKg: Number.isFinite(capacityTonnes) ? Math.max(0, Math.round(capacityTonnes * 1000)) : 0
      }
    }
  };
}
