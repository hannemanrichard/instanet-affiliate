import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type { EarningLine } from "../domain";
import type { EarningsRepository } from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type CommissionRow = Tables["commissions"]["Row"];
type OrderRow = Tables["orders"]["Row"];

type CommissionWithOrder = CommissionRow & {
  orders?: Pick<OrderRow, "status" | "dc_recent_status" | "created_at"> | null;
};

const ENCAISSE = "encaisse";

export class SupabaseEarningsService implements EarningsRepository {
  async getEarningLines(partnerId: number): Promise<EarningLine[]> {
    return withPerformanceTracking(
      "EarningsService",
      "getEarningLines",
      async () => {
        const rows = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from("commissions")
              .select(
                `
                  id,
                  partner_id,
                  order_id,
                  product_id,
                  product_name,
                  quantity,
                  unit_commission,
                  unit_discount,
                  amount,
                  is_earned,
                  created_at,
                  orders (
                    status,
                    dc_recent_status,
                    created_at
                  )
                `
              )
              .eq("partner_id", partnerId)
              .order("created_at", { ascending: false });

            if (error) throw error;
            return { data: (data ?? []) as CommissionWithOrder[], error };
          },
          {
            operation: "getEarningLines",
            table: "commissions",
            metadata: { partnerId },
          }
        );

        const lines: EarningLine[] = [];

        for (const row of rows) {
          const order = row.orders;
          if (!order) continue;

          const isEncaisse =
            (order.dc_recent_status ?? "").toLowerCase() === ENCAISSE;
          const isEarned = row.is_earned === true;

          // Ready: encaisse. Not ready: earned (delivered) but not encaisse.
          if (!isEncaisse && !isEarned) {
            continue;
          }

          lines.push({
            commissionId: row.id,
            orderId: row.order_id,
            productName: row.product_name ?? undefined,
            quantity: row.quantity,
            commissionRate: Number(row.unit_commission),
            unitDiscount: Number(row.unit_discount),
            commissionAmount: Number(row.amount),
            status: order.status ?? undefined,
            dcRecentStatus: order.dc_recent_status ?? undefined,
            bucket: isEncaisse ? "ready" : "not_ready",
            createdAt: row.created_at,
          });
        }

        return lines;
      }
    );
  }
}
