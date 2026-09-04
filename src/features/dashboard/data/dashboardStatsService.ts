import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type {
  DailyDashboardSnapshot,
  DashboardDateRange,
  DashboardStatsRepository,
} from "../domain";
import {
  aggregateOrdersIntoDailySnapshots,
  type DashboardOrderRow,
} from "./aggregateOrdersIntoDailySnapshots";

export class SupabaseDashboardStatsRepository
  implements DashboardStatsRepository
{
  private readonly tableName = "orders";

  async getDailySnapshots(
    partnerId: number,
    range: DashboardDateRange
  ): Promise<DailyDashboardSnapshot[]> {
    return withPerformanceTracking(
      "DashboardStatsRepository",
      "getDailySnapshots",
      async () => {
        const rows = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select("created_at, status, product_price, product_qty")
              .eq("partner_id", partnerId)
              .gte("created_at", `${range.fromDate}T00:00:00.000Z`)
              .lte("created_at", `${range.toDate}T23:59:59.999Z`)
              .order("created_at", { ascending: true });

            if (error) throw error;
            return { data: (data ?? []) as DashboardOrderRow[], error };
          },
          {
            operation: "getDailySnapshots",
            table: this.tableName,
            metadata: { partnerId, range },
          }
        );

        return aggregateOrdersIntoDailySnapshots(rows, range);
      }
    );
  }
}
