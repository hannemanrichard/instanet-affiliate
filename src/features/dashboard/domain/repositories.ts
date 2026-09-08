import type {
  DailyDashboardSnapshot,
  DashboardDateRange,
  DashboardPerformer,
} from "./entities";

export interface DashboardStatsRepository {
  getDailySnapshots(
    partnerId: number | undefined,
    range: DashboardDateRange
  ): Promise<DailyDashboardSnapshot[]>;
  getTopPerformers(
    partnerId: number | undefined,
    range: DashboardDateRange
  ): Promise<{
    topProductsBySales: DashboardPerformer[];
    topProductsByOrders: DashboardPerformer[];
    topAffiliatesBySales: DashboardPerformer[];
    topAffiliatesByOrders: DashboardPerformer[];
  }>;
}
