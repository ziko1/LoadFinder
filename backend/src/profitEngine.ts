export type ProfitInput = {
  loadPriceEur: number;
  totalKm: number;
  fuelLitersPer100Km: number;
  fuelPriceEurPerLiter: number;
  tollsEur: number;
  driverCostEur: number;
  otherCostEur: number;
};

export function calculateProfit(x: ProfitInput) {
  const fuelLiters = x.totalKm * x.fuelLitersPer100Km / 100;
  const fuelCost = fuelLiters * x.fuelPriceEurPerLiter;
  const totalCost = fuelCost + x.tollsEur + x.driverCostEur + x.otherCostEur;
  const profitEur = x.loadPriceEur - totalCost;

  return {
    fuelLiters,
    fuelCost,
    totalCost,
    profitEur,
    eurPerKm: x.totalKm > 0 ? x.loadPriceEur / x.totalKm : 0,
    profitPerKm: x.totalKm > 0 ? profitEur / x.totalKm : 0
  };
}
