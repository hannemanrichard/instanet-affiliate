import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type {
  DailyDashboardSnapshot,
  DashboardDateRange,
  DashboardPerformer,
  DashboardStatsRepository,
} from "../domain";
import {
  aggregateOrdersIntoDailySnapshots,
  type DashboardOrderRow,
} from "./aggregateOrdersIntoDailySnapshots";

type PerformerOrderRow = {
  partner_id: number | null;
  product: string | null;
  product_price: number | null;
  shipping_price: number | null;
  delivery_fees: number | null;
};

type PartnerSummaryRow = {
  id: number;
  fullname: string | null;
  username: string | null;
  email: string | null;
  avatar: string | null;
};

const TOP_PERFORMERS_LIMIT = 5;

const toSalesAmount = (row: PerformerOrderRow): number =>
  Number(row.product_price ?? 0) +
  Number(row.shipping_price ?? 0) -
  Number(row.delivery_fees ?? 0);

const toTopPerformers = (
  entries: Iterable<DashboardPerformer>,
  sortBy: "salesAmount" | "orderCount"
): DashboardPerformer[] =>
  [...entries]
    .sort((left, right) => {
      if (right[sortBy] !== left[sortBy]) {
        return right[sortBy] - left[sortBy];
      }

      if (sortBy === "salesAmount" && right.orderCount !== left.orderCount) {
        return right.orderCount - left.orderCount;
      }

      if (sortBy === "orderCount" && right.salesAmount !== left.salesAmount) {
        return right.salesAmount - left.salesAmount;
      }

      return left.label.localeCompare(right.label);
    })
    .slice(0, TOP_PERFORMERS_LIMIT);

export class SupabaseDashboardStatsRepository
  implements DashboardStatsRepository
{
  private readonly tableName = "orders";

  async getDailySnapshots(
    partnerId: number | undefined,
    range: DashboardDateRange
  ): Promise<DailyDashboardSnapshot[]> {
    return withPerformanceTracking(
      "DashboardStatsRepository",
      "getDailySnapshots",
      async () => {
        const rows = await DatabaseWrapper.executeQuery(
          async () => {
            let query = supabase
              .from(this.tableName)
              .select("created_at, status, product_price, product_qty")
              .gte("created_at", `${range.fromDate}T00:00:00.000Z`)
              .lte("created_at", `${range.toDate}T23:59:59.999Z`)
              .order("created_at", { ascending: true });

            if (partnerId != null) {
              query = query.eq("partner_id", partnerId);
            }

            const { data, error } = await query;

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

  async getTopPerformers(
    partnerId: number | undefined,
    range: DashboardDateRange
  ): Promise<{
    topProductsBySales: DashboardPerformer[];
    topProductsByOrders: DashboardPerformer[];
    topAffiliatesBySales: DashboardPerformer[];
    topAffiliatesByOrders: DashboardPerformer[];
  }> {
    return withPerformanceTracking(
      "DashboardStatsRepository",
      "getTopPerformers",
      async () => {
        const rows = await DatabaseWrapper.executeQuery(
          async () => {
            let query = supabase
              .from(this.tableName)
              .select(
                "partner_id, product, product_price, shipping_price, delivery_fees"
              )
              .gte("created_at", `${range.fromDate}T00:00:00.000Z`)
              .lte("created_at", `${range.toDate}T23:59:59.999Z`);

            if (partnerId != null) {
              query = query.eq("partner_id", partnerId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return { data: (data ?? []) as PerformerOrderRow[], error };
          },
          {
            operation: "getTopPerformers",
            table: this.tableName,
            metadata: { partnerId, range },
          }
        );

        const productTotals = new Map<string, DashboardPerformer>();
        const affiliateTotals = new Map<number, DashboardPerformer>();

        for (const row of rows) {
          const salesAmount = toSalesAmount(row);
          const productLabel = row.product?.trim() || "Unknown product";
          const productEntry = productTotals.get(productLabel) ?? {
            key: productLabel,
            label: productLabel,
            salesAmount: 0,
            orderCount: 0,
          };

          productEntry.salesAmount += salesAmount;
          productEntry.orderCount += 1;
          productTotals.set(productLabel, productEntry);

          if (row.partner_id == null) continue;

          const affiliateEntry = affiliateTotals.get(row.partner_id) ?? {
            key: String(row.partner_id),
            label: `Affiliate #${row.partner_id}`,
            salesAmount: 0,
            orderCount: 0,
          };

          affiliateEntry.salesAmount += salesAmount;
          affiliateEntry.orderCount += 1;
          affiliateTotals.set(row.partner_id, affiliateEntry);
        }

        const partnerIds = [...affiliateTotals.keys()];

        if (partnerIds.length > 0) {
          const partners = await DatabaseWrapper.executeQuery(
            async () => {
              const { data, error } = await supabase
                .from("partners")
                .select("id, fullname, username, email, avatar")
                .in("id", partnerIds);

              if (error) throw error;
              return { data: (data ?? []) as PartnerSummaryRow[], error };
            },
            {
              operation: "getTopPerformers.partners",
              table: "partners",
              metadata: { partnerIds },
            }
          );

          for (const partner of partners) {
            const entry = affiliateTotals.get(partner.id);
            if (!entry) continue;

            entry.label =
              partner.fullname?.trim() ||
              partner.username?.trim() ||
              partner.email?.trim() ||
              `Affiliate #${partner.id}`;
            entry.secondaryLabel =
              partner.email?.trim() || partner.username?.trim() || undefined;
            entry.imageUrl = partner.avatar?.trim() || undefined;
          }
        }

        return {
          topProductsBySales: toTopPerformers(productTotals.values(), "salesAmount"),
          topProductsByOrders: toTopPerformers(productTotals.values(), "orderCount"),
          topAffiliatesBySales: toTopPerformers(affiliateTotals.values(), "salesAmount"),
          topAffiliatesByOrders: toTopPerformers(affiliateTotals.values(), "orderCount"),
        };
      }
    );
  }
}
