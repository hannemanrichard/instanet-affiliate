import type {
  DailyDashboardSnapshot,
  DashboardDateRange,
} from "./entities";

export interface DashboardStatsRepository {
  getDailySnapshots(
    partnerId: number,
    range: DashboardDateRange
  ): Promise<DailyDashboardSnapshot[]>;
}
