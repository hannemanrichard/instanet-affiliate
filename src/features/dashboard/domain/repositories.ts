import type {
  DailyDashboardSnapshot,
  DashboardDateRange,
} from "./entities";

export interface DashboardStatsRepository {
  getDailySnapshots(
    partnerId: number | undefined,
    range: DashboardDateRange
  ): Promise<DailyDashboardSnapshot[]>;
}
