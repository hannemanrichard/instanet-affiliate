import type { RateLevel } from "./entities";

export const GOOD_RATE_THRESHOLD = 80;
export const WARNING_RATE_THRESHOLD = 60;

export const resolveRateLevel = (ratePercent: number): RateLevel => {
  if (ratePercent >= GOOD_RATE_THRESHOLD) return "good";
  if (ratePercent >= WARNING_RATE_THRESHOLD) return "warning";
  return "poor";
};

export const toRatePercent = (numerator: number, denominator: number) => {
  if (denominator <= 0) return 0;
  return (numerator / denominator) * 100;
};

export const roundRatePercent = (value: number) => Math.round(value * 10) / 10;
