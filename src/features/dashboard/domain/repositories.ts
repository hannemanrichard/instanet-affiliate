import type {
  DailyDashboardSnapshot,
  DashboardDateRange,
} from "./entities";

export interface DashboardStatsRepository {
  getDailySnapshots(
    range: DashboardDateRange
  ): Promise<DailyDashboardSnapshot[]>;
}
