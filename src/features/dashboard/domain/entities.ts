export type DashboardDateRangePreset =
  | "last_7_days"
  | "last_14_days"
  | "last_30_days"
  | "last_90_days"
  | "this_month";

export type RateLevel = "good" | "warning" | "poor";

export type DashboardDateRange = {
  fromDate: string;
  toDate: string;
  preset: DashboardDateRangePreset;
};

export type DailyDashboardSnapshot = {
  date: string;
  salesAmount: number;
  orderCount: number;
  confirmedCount: number;
  deliveredCount: number;
};

export type DashboardSeriesPoint = {
  date: string;
  value: number;
};

export type DashboardRateStat = {
  ratePercent: number;
  level: RateLevel;
  changePercent: number;
  series: DashboardSeriesPoint[];
};

export type DashboardMetricStat = {
  total: number;
  changePercent: number;
};

export type DashboardOverview = {
  range: DashboardDateRange;
  delivery: DashboardRateStat;
  confirmation: DashboardRateStat;
  sales: DashboardMetricStat;
  salesSeries: DashboardSeriesPoint[];
  ordersSeries: DashboardSeriesPoint[];
};

export const DASHBOARD_DATE_RANGE_PRESETS: DashboardDateRangePreset[] = [
  "last_7_days",
  "last_14_days",
  "last_30_days",
  "last_90_days",
  "this_month",
];
