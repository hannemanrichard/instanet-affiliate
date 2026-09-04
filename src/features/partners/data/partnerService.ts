import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type {
  PartnerEntity,
  UpsertPartnerInput,
  UpdatePaymentInput,
} from "../domain";
import type { PartnerRepository } from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type PartnerRow = Tables["partners"]["Row"];

export class SupabasePartnerService implements PartnerRepository {
  private readonly tableName = "partners";

  async getByEmail(email: string): Promise<PartnerEntity | null> {
    return withPerformanceTracking("PartnerService", "getByEmail", async () => {
      const normalized = email.trim().toLowerCase();
      if (!normalized) return null;

      const row = await DatabaseWrapper.executeQuery(
        async () => {
          const { data, error } = await supabase
            .from(this.tableName)
            .select("*")
            .ilike("email", normalized)
            .maybeSingle();

          if (error) throw error;
          return { data, error };
        },
        {
          operation: "getByEmail",
          table: this.tableName,
          metadata: { email: normalized },
        }
      );

      return row ? this.mapRowToEntity(row) : null;
    });
  }

  async getById(id: number): Promise<PartnerEntity | null> {
    return withPerformanceTracking("PartnerService", "getById", async () => {
      const row = await DatabaseWrapper.executeQuery(
        async () => {
          const { data, error } = await supabase
            .from(this.tableName)
            .select("*")
            .eq("id", id)
            .maybeSingle();

          if (error) throw error;
          return { data, error };
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

  async upsertByEmail(data: UpsertPartnerInput): Promise<PartnerEntity> {
    return withPerformanceTracking(
      "PartnerService",
      "upsertByEmail",
      async () => {
        const email = data.email.trim().toLowerCase();
        const existing = await this.getByEmail(email);

        if (existing) {
          const row = await DatabaseWrapper.executeMutation(
            async () => {
              const { data: updated, error } = await supabase
                .from(this.tableName)
                .update({
                  fullname: data.fullname ?? existing.fullname ?? null,
                  username: data.username ?? existing.username ?? null,
                  avatar: data.avatar ?? existing.avatar ?? null,
                })
                .eq("id", existing.id)
                .select()
                .single();

              if (error) throw error;
              return { data: updated, error };
            },
            {
              operation: "upsertByEmail.update",
              table: this.tableName,
              metadata: { email },
              auditLog: {
                enabled: true,
                action: "UPDATE",
                recordId: existing.id,
              },
            }
          );

          return this.mapRowToEntity(row);
        }

        const row = await DatabaseWrapper.executeMutation(
          async () => {
            const { data: created, error } = await supabase
              .from(this.tableName)
              .insert({
                email,
                fullname: data.fullname ?? null,
                username:
                  data.username ?? email.split("@")[0] ?? null,
                avatar: data.avatar ?? null,
                status: "active",
              })
              .select()
              .single();

            if (error) throw error;
            return { data: created, error };
          },
          {
            operation: "upsertByEmail.insert",
            table: this.tableName,
            metadata: { email },
            auditLog: {
              enabled: true,
              action: "INSERT",
            },
          }
        );

        return this.mapRowToEntity(row);
      }
    );
  }

  async updatePayment(
    id: number,
    data: UpdatePaymentInput
  ): Promise<PartnerEntity> {
    return withPerformanceTracking(
      "PartnerService",
      "updatePayment",
      async () => {
        const row = await DatabaseWrapper.executeMutation(
          async () => {
            const { data: updated, error } = await supabase
              .from(this.tableName)
              .update({
                baridimob_rib: data.baridimob_rib ?? null,
                redotpay_account: data.redotpay_account ?? null,
                usdt_address: data.usdt_address ?? null,
              })
              .eq("id", id)
              .select()
              .single();

            if (error) throw error;
            return { data: updated, error };
          },
          {
            operation: "updatePayment",
            table: this.tableName,
            metadata: { id },
            auditLog: {
              enabled: true,
              action: "UPDATE",
              recordId: id,
            },
          }
        );

        return this.mapRowToEntity(row);
      }
    );
  }

  private mapRowToEntity = (row: PartnerRow): PartnerEntity => ({
    id: row.id,
    email: row.email ?? undefined,
    fullname: row.fullname ?? undefined,
    username: row.username ?? undefined,
    avatar: row.avatar ?? undefined,
    bio: row.bio ?? undefined,
    status: row.status,
    created_at: row.created_at,
    baridimob_rib: row.baridimob_rib ?? undefined,
    redotpay_account: row.redotpay_account ?? undefined,
    usdt_address: row.usdt_address ?? undefined,
  });
}
