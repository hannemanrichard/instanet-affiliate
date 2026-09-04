import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type { CreateWithdrawInput, WithdrawEntity } from "../domain";
import type { WithdrawRepository } from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type WithdrawRow = Tables["withdraws"]["Row"];

export class SupabaseWithdrawService implements WithdrawRepository {
  private readonly tableName = "withdraws";

  async getByPartnerId(partnerId: number): Promise<WithdrawEntity[]> {
    return withPerformanceTracking(
      "WithdrawService",
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

  async create(data: CreateWithdrawInput): Promise<WithdrawEntity> {
    return withPerformanceTracking("WithdrawService", "create", async () => {
      const row = await DatabaseWrapper.executeMutation(
        async () => {
          const { data: created, error } = await supabase
            .from(this.tableName)
            .insert({
              partner_id: data.partner_id,
              amount: data.amount,
              is_paid: false,
            })
            .select()
            .single();

          if (error) throw error;
          return { data: created, error };
        },
        {
          operation: "create",
          table: this.tableName,
          metadata: { partnerId: data.partner_id, amount: data.amount },
          auditLog: {
            enabled: true,
            action: "INSERT",
            newValues: {
              partner_id: data.partner_id,
              amount: data.amount,
              is_paid: false,
            },
          },
        }
      );

      return this.mapRowToEntity(row);
    });
  }

  private mapRowToEntity = (row: WithdrawRow): WithdrawEntity => ({
    id: row.id,
    partner_id: row.partner_id,
    amount: row.amount,
    is_paid: row.is_paid,
    created_at: row.created_at,
  });
}
