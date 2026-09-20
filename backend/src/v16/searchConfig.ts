import { z } from 'zod';

const Env = z.object({
  LF_MAX_EMPTY_KM: z.coerce.number().nonnegative().default(100),
  LF_MIN_EUR_PER_KM: z.coerce.number().nonnegative().default(0.8),
  LF_MIN_PRICE_EUR: z.coerce.number().nonnegative().default(0),
  LF_FUEL_L100: z.coerce.number().positive().default(9),
  LF_FUEL_EUR_L: z.coerce.number().positive().default(1.7),
  LF_TOLL_EUR: z.coerce.number().nonnegative().default(0),
  LF_DRIVER_COST_EUR: z.coerce.number().nonnegative().default(0),
  LF_OTHER_COST_EUR: z.coerce.number().nonnegative().default(0),
});

export function loadRankingConfig() {
  const e = Env.parse(process.env);
  return {
    maxEmptyKm: e.LF_MAX_EMPTY_KM,
    minEurPerKm: e.LF_MIN_EUR_PER_KM,
    minPriceEur: e.LF_MIN_PRICE_EUR,
    fuelL100: e.LF_FUEL_L100,
    fuelEurL: e.LF_FUEL_EUR_L,
    tollEur: e.LF_TOLL_EUR,
    driverCostEur: e.LF_DRIVER_COST_EUR,
    otherCostEur: e.LF_OTHER_COST_EUR,
  };
}
