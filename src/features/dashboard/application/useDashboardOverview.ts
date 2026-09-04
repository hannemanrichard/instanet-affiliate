import { useStandardQuery } from "@/shared/hooks/useReactQuery";
import { apiFetch } from "@/shared/utils/apiFetch";
import type { DashboardDateRange, DashboardOverview } from "../domain";

const dashboardOverviewKey = (range: DashboardDateRange) => [
  "dashboard",
  "overview",
  range.preset,
  range.fromDate,
  range.toDate,
];

const buildDashboardUrl = (range: DashboardDateRange) => {
  const params = new URLSearchParams({
    from: range.fromDate,
    to: range.toDate,
    preset: range.preset,
  });
  return `/api/dashboard?${params.toString()}`;
};

export const useDashboardOverview = (range: DashboardDateRange) => {
  return useStandardQuery<DashboardOverview>(
    dashboardOverviewKey(range),
    () => apiFetch<DashboardOverview>(buildDashboardUrl(range)),
    {
      staleTime: 60 * 1000,
    }
  );
};
