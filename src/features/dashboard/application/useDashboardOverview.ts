import { useStandardQuery } from "@/shared/hooks/useReactQuery";
import type { DashboardDateRange, DashboardOverview } from "../domain";
import { dashboardApplicationService } from "./services/dashboardApplicationService";

const dashboardOverviewKey = (range: DashboardDateRange) => [
  "dashboard",
  "overview",
  range.preset,
  range.fromDate,
  range.toDate,
];

export const useDashboardOverview = (range: DashboardDateRange) => {
  return useStandardQuery<DashboardOverview>(
    dashboardOverviewKey(range),
    () => dashboardApplicationService.getOverview(range),
    {
      staleTime: 60 * 1000,
    }
  );
};
