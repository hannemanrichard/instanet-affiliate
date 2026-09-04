export const formatDashboardAmount = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(amount);

const formatAbsolute = (value: number) =>
  Math.abs(value)
    .toFixed(1)
    .replace(/\.0$/, "");

/** Magnitude only — direction is shown with arrow icons in the UI. */
export const formatTrendPercent = (value: number) => `${formatAbsolute(value)}%`;

export const formatChartAxisDate = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    numberingSystem: "latn",
  }).format(date);
};
