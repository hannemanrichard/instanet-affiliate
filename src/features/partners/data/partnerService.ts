import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type {
  PartnerEntity,
  UpsertPartnerInput,
  UpdatePaymentInput,
  UpdatePartnerStatusInput,
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

  async listAll(search?: string): Promise<PartnerEntity[]> {
    return withPerformanceTracking("PartnerService", "listAll", async () => {
      const normalizedSearch = search?.trim().toLowerCase();

      const rows = await DatabaseWrapper.executeQuery(
        async () => {
          let query = supabase
            .from(this.tableName)
            .select("*")
            .order("created_at", { ascending: false });

          if (normalizedSearch) {
            query = query.or(
              `email.ilike.%${normalizedSearch}%,fullname.ilike.%${normalizedSearch}%,username.ilike.%${normalizedSearch}%`
            );
          }

          const { data, error } = await query;
          if (error) throw error;
          return { data: data ?? [], error };
        },
        {
          operation: "listAll",
          table: this.tableName,
          metadata: { search: normalizedSearch },
        }
      );

      return rows.map(this.mapRowToEntity);
    });
  }

  async upsertByEmail(data: UpsertPartnerInput): Promise<PartnerEntity> {
    return withPerformanceTracking(
      "PartnerService",
      "upsertByEmail",
      async () => {
        const email = data.email.trim().toLowerCase();
        const nextFullname = data.fullname?.trim() || undefined;
        const nextUsername = data.username?.trim() || undefined;
        const nextAvatar = data.avatar?.trim() || undefined;
        const existing = await this.getByEmail(email);

        if (existing) {
          const hasChanges =
            (nextFullname ?? existing.fullname ?? undefined) !==
              (existing.fullname ?? undefined) ||
            (nextUsername ?? existing.username ?? undefined) !==
              (existing.username ?? undefined) ||
            (nextAvatar ?? existing.avatar ?? undefined) !==
              (existing.avatar ?? undefined);

          if (!hasChanges) {
            return existing;
          }

          const row = await DatabaseWrapper.executeMutation(
            async () => {
              const { data: updated, error } = await supabase
                .from(this.tableName)
                .update({
                  fullname: nextFullname ?? existing.fullname ?? null,
                  username: nextUsername ?? existing.username ?? null,
                  avatar: nextAvatar ?? existing.avatar ?? null,
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
                oldValues: {
                  fullname: existing.fullname ?? null,
                  username: existing.username ?? null,
                  avatar: existing.avatar ?? null,
                },
                newValues: {
                  fullname: nextFullname ?? existing.fullname ?? null,
                  username: nextUsername ?? existing.username ?? null,
                  avatar: nextAvatar ?? existing.avatar ?? null,
                },
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
                fullname: nextFullname ?? null,
                username:
                  nextUsername ?? email.split("@")[0] ?? null,
                avatar: nextAvatar ?? null,
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

  async updateStatus(
    id: number,
    data: UpdatePartnerStatusInput
  ): Promise<PartnerEntity> {
    return withPerformanceTracking(
      "PartnerService",
      "updateStatus",
      async () => {
        const row = await DatabaseWrapper.executeMutation(
          async () => {
            const { data: updated, error } = await supabase
              .from(this.tableName)
              .update({
                status: data.status,
              })
              .eq("id", id)
              .select()
              .single();

            if (error) throw error;
            return { data: updated, error };
          },
          {
            operation: "updateStatus",
            table: this.tableName,
            metadata: { id, status: data.status },
            auditLog: {
              enabled: true,
              action: "UPDATE",
              recordId: id,
              newValues: {
                status: data.status,
              },
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
