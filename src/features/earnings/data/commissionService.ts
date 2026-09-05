import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type { CommissionEntity, CreateCommissionInput } from "../domain";
import type { CommissionRepository } from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type CommissionRow = Tables["commissions"]["Row"];

export class SupabaseCommissionService implements CommissionRepository {
  private readonly tableName = "commissions";

  async create(
    data: CreateCommissionInput,
    changedBy?: number
  ): Promise<CommissionEntity> {
    return withPerformanceTracking("CommissionService", "create", async () => {
      const row = await DatabaseWrapper.executeMutation(
        async () => {
          const { data: created, error } = await supabase
            .from(this.tableName)
            .insert({
              partner_id: data.partner_id,
              order_id: data.order_id,
              product_id: data.product_id ?? null,
              product_name: data.product_name ?? null,
              quantity: data.quantity,
              unit_commission: data.unit_commission,
              unit_discount: data.unit_discount ?? 0,
              amount: data.amount,
              is_earned: data.is_earned ?? false,
            })
            .select()
            .single();

          if (error) throw error;
          return { data: created, error };
        },
        {
          operation: "create",
          table: this.tableName,
          metadata: {
            partnerId: data.partner_id,
            orderId: data.order_id,
            amount: data.amount,
          },
          auditLog: {
            enabled: true,
            action: "INSERT",
            changedBy,
            newValues: {
              partner_id: data.partner_id,
              order_id: data.order_id,
              amount: data.amount,
              unit_commission: data.unit_commission,
              unit_discount: data.unit_discount ?? 0,
              is_earned: data.is_earned ?? false,
            },
          },
        }
      );

      return this.mapRowToEntity(row);
    });
  }

  async getByOrderId(orderId: number): Promise<CommissionEntity | null> {
    return withPerformanceTracking(
      "CommissionService",
      "getByOrderId",
      async () => {
        const row = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select("*")
              .eq("order_id", orderId)
              .maybeSingle();

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "getByOrderId",
            table: this.tableName,
            metadata: { orderId },
          }
        );

        return row ? this.mapRowToEntity(row) : null;
      }
    );
  }

  async getByPartnerId(partnerId: number): Promise<CommissionEntity[]> {
    return withPerformanceTracking(
      "CommissionService",
      "getByPartnerId",
      async () => {
        const rows = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select("*")
              .eq("partner_id", partnerId)
              .order("created_at", { ascending: false });

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "getByPartnerId",
            table: this.tableName,
            metadata: { partnerId },
          }
        );

        return rows.map(this.mapRowToEntity);
      }
    );
  }

  async markEarnedByOrderId(
    orderId: number,
    changedBy?: number
  ): Promise<void> {
    return withPerformanceTracking(
      "CommissionService",
      "markEarnedByOrderId",
      async () => {
        await DatabaseWrapper.executeMutation(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .update({ is_earned: true })
              .eq("order_id", orderId)
              .eq("is_earned", false)
              .select("id");

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "markEarnedByOrderId",
            table: this.tableName,
            metadata: { orderId },
            auditLog: {
              enabled: true,
              action: "UPDATE",
              changedBy,
              newValues: { order_id: orderId, is_earned: true },
            },
          }
        );
      }
    );
  }

  private mapRowToEntity = (row: CommissionRow): CommissionEntity => ({
    id: row.id,
    partner_id: row.partner_id,
    order_id: row.order_id,
    product_id: row.product_id ?? undefined,
    product_name: row.product_name ?? undefined,
    quantity: row.quantity,
    unit_commission: Number(row.unit_commission),
    unit_discount: Number(row.unit_discount),
    amount: Number(row.amount),
    is_earned: row.is_earned ?? false,
    created_at: row.created_at,
  });
}
