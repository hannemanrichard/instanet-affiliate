import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type {
  CreateWithdrawInput,
  UpdateWithdrawStatusInput,
  WithdrawEntity,
} from "../domain";
import type { WithdrawRepository } from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type WithdrawRow = Tables["withdraws"]["Row"];
type PartnerRow = Tables["partners"]["Row"];
type WithdrawWithPartnerRow = WithdrawRow & {
  partners?:
    | Pick<
        PartnerRow,
        | "avatar"
        | "fullname"
        | "email"
        | "username"
        | "baridimob_rib"
        | "redotpay_account"
        | "usdt_address"
      >
    | null;
};

export class SupabaseWithdrawService implements WithdrawRepository {
  private readonly tableName = "withdraws";

  async getByPartnerId(partnerId?: number): Promise<WithdrawEntity[]> {
    return withPerformanceTracking(
      "WithdrawService",
      "getByPartnerId",
      async () => {
        const rows = await DatabaseWrapper.executeQuery(
          async () => {
            let query = supabase
              .from(this.tableName)
              .select(
                `
                  *,
                  partners (
                    avatar,
                    fullname,
                    email,
                    username,
                    baridimob_rib,
                    redotpay_account,
                    usdt_address
                  )
                `
              )
              .order("created_at", { ascending: false });

            if (partnerId != null) {
              query = query.eq("partner_id", partnerId);
            }

            const { data, error } = await query;

            if (error) throw error;
            return { data: (data ?? []) as WithdrawWithPartnerRow[], error };
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

  async getById(id: number): Promise<WithdrawEntity | null> {
    return withPerformanceTracking("WithdrawService", "getById", async () => {
      const row = await DatabaseWrapper.executeQuery(
        async () => {
          const { data, error } = await supabase
            .from(this.tableName)
            .select(
              `
                *,
                partners (
                  avatar,
                  fullname,
                  email,
                  username,
                  baridimob_rib,
                  redotpay_account,
                  usdt_address
                )
              `
            )
            .eq("id", id)
            .maybeSingle();

          if (error) throw error;
          return { data: data as WithdrawWithPartnerRow | null, error };
        },
        {
          operation: "getById",
          table: this.tableName,
          metadata: { id },
        }
      );

      return row ? this.mapRowToEntity(row) : null;
    });
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
              status: "pending",
            })
            .select(
              `
                *,
                partners (
                  avatar,
                  fullname,
                  email,
                  username,
                  baridimob_rib,
                  redotpay_account,
                  usdt_address
                )
              `
            )
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
              status: "pending",
            },
          },
        }
      );

      return this.mapRowToEntity(row);
    });
  }

  async updateStatus(
    input: UpdateWithdrawStatusInput
  ): Promise<WithdrawEntity> {
    return withPerformanceTracking(
      "WithdrawService",
      "updateStatus",
      async () => {
        const row = await DatabaseWrapper.executeMutation(
          async () => {
            const { data: updated, error } = await supabase
              .from(this.tableName)
              .update({
                status: input.status,
                is_paid: input.status === "approved",
              })
              .eq("id", input.id)
              .select(
                `
                  *,
                  partners (
                    avatar,
                    fullname,
                    email,
                    username,
                    baridimob_rib,
                    redotpay_account,
                    usdt_address
                  )
                `
              )
              .single();

            if (error) throw error;
            return { data: updated, error };
          },
          {
            operation: "updateStatus",
            table: this.tableName,
            metadata: { id: input.id, status: input.status },
            auditLog: {
              enabled: true,
              action: "UPDATE",
              recordId: input.id,
              newValues: {
                status: input.status,
                is_paid: input.status === "approved",
              },
            },
          }
        );

        return this.mapRowToEntity(row);
      }
    );
  }

  private mapRowToEntity = (row: WithdrawWithPartnerRow): WithdrawEntity => ({
    id: row.id,
    partner_id: row.partner_id,
    partner_avatar: row.partners?.avatar ?? undefined,
    partner_name: row.partners?.fullname ?? undefined,
    partner_email: row.partners?.email ?? undefined,
    partner_username: row.partners?.username ?? undefined,
    partner_baridimob_rib: row.partners?.baridimob_rib ?? undefined,
    partner_redotpay_account: row.partners?.redotpay_account ?? undefined,
    partner_usdt_address: row.partners?.usdt_address ?? undefined,
    amount: row.amount,
    is_paid: row.is_paid,
    status: (row.status ?? (row.is_paid ? "approved" : "pending")) as
      | "pending"
      | "approved"
      | "denied",
    created_at: row.created_at,
  });
}
