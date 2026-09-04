import {
  differenceInCalendarDays,
  format,
  startOfMonth,
  subDays,
} from "date-fns";
import type {
  DashboardDateRange,
  DashboardDateRangePreset,
} from "./entities";

const DATE_FORMAT = "yyyy-MM-dd";

export const formatDashboardDate = (date: Date) => format(date, DATE_FORMAT);

export const resolveDashboardDateRange = (
  preset: DashboardDateRangePreset,
  now = new Date()
): DashboardDateRange => {
  const toDate = formatDashboardDate(now);

  if (preset === "this_month") {
    return {
      preset,
      fromDate: formatDashboardDate(startOfMonth(now)),
      toDate,
    };
  }

  const dayCount =
    preset === "last_7_days"
      ? 7
      : preset === "last_14_days"
        ? 14
        : preset === "last_90_days"
          ? 90
          : 30;

  return {
    preset,
    fromDate: formatDashboardDate(subDays(now, dayCount - 1)),
    toDate,
  };
};

export const getPreviousDashboardDateRange = (
  range: DashboardDateRange
): DashboardDateRange => {
  const from = new Date(`${range.fromDate}T00:00:00`);
  const to = new Date(`${range.toDate}T00:00:00`);
  const durationDays = differenceInCalendarDays(to, from) + 1;
  const previousTo = subDays(from, 1);
  const previousFrom = subDays(previousTo, durationDays - 1);

  return {
    preset: range.preset,
    fromDate: formatDashboardDate(previousFrom),
    toDate: formatDashboardDate(previousTo),
  };
};
