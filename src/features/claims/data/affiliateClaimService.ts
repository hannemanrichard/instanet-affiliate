import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type {
  AffiliateClaimAttachmentEntity,
  AffiliateClaimCategory,
  AffiliateClaimEntity,
  AffiliateClaimStatus,
  CreateAffiliateClaimInput,
  UpdateAffiliateClaimStatusInput,
} from "../domain";
import type {
  AffiliateClaimListFilters,
  AffiliateClaimPagination,
  AffiliateClaimRepository,
  PaginatedAffiliateClaimsResult,
} from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type ClaimRow = Tables["affiliate_claims"]["Row"];
type AttachmentRow = Tables["affiliate_claim_attachments"]["Row"];
type PartnerRow = Tables["partners"]["Row"];
type OrderRow = Tables["orders"]["Row"];

type ClaimWithRelationsRow = ClaimRow & {
  partners?: Pick<PartnerRow, "fullname" | "email" | "avatar"> | null;
  orders?: Pick<
    OrderRow,
    | "product"
    | "status"
    | "tracking_id"
    | "first_name"
    | "last_name"
    | "phone"
    | "wilaya"
    | "commune"
  > | null;
  affiliate_claim_attachments?: AttachmentRow[] | null;
};

export class SupabaseAffiliateClaimService implements AffiliateClaimRepository {
  private readonly tableName = "affiliate_claims";

  async list(
    filters: AffiliateClaimListFilters,
    pagination: AffiliateClaimPagination
  ): Promise<PaginatedAffiliateClaimsResult> {
    return withPerformanceTracking("AffiliateClaimService", "list", async () => {
      const page = Math.max(1, pagination.page);
      const limit = Math.min(100, Math.max(1, pagination.limit));
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { rows, total } = await DatabaseWrapper.executeQuery(
        async () => {
          let query = supabase
            .from(this.tableName)
            .select(
              `
                *,
                partners (
                  fullname,
                  email,
                  avatar
                ),
                orders (
                  product,
                  status,
                  tracking_id,
                  first_name,
                  last_name,
                  phone,
                  wilaya,
                  commune
                ),
                affiliate_claim_attachments (
                  *
                )
              `,
              { count: "exact" }
            )
            .order("created_at", { ascending: false })
            .range(from, to);

          if (filters.partnerId != null) {
            query = query.eq("partner_id", filters.partnerId);
          }

          if (filters.status) {
            query = query.eq("status", filters.status);
          }

          const { data, error, count } = await query;
          if (error) throw error;

          return {
            data: {
              rows: (data ?? []) as ClaimWithRelationsRow[],
              total: count ?? 0,
            },
            error,
          };
        },
        {
          operation: "list",
          table: this.tableName,
          metadata: { filters, pagination },
        }
      );

      return {
        claims: rows.map(this.mapRowToEntity),
        total,
        page,
        limit,
      };
    });
  }

  async getById(id: number): Promise<AffiliateClaimEntity | null> {
    return withPerformanceTracking("AffiliateClaimService", "getById", async () => {
      const row = await DatabaseWrapper.executeQuery(
        async () => {
          const { data, error } = await supabase
            .from(this.tableName)
            .select(
              `
                *,
                partners (
                  fullname,
                  email,
                  avatar
                ),
                orders (
                  product,
                  status,
                  tracking_id,
                  first_name,
                  last_name,
                  phone,
                  wilaya,
                  commune
                ),
                affiliate_claim_attachments (
                  *
                )
              `
            )
            .eq("id", id)
            .maybeSingle();

          if (error) throw error;
          return { data: data as ClaimWithRelationsRow | null, error };
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

  async create(input: CreateAffiliateClaimInput): Promise<AffiliateClaimEntity> {
    return withPerformanceTracking("AffiliateClaimService", "create", async () => {
      const created = await DatabaseWrapper.executeMutation(
        async () => {
          const { data, error } = await supabase
            .from(this.tableName)
            .insert({
              partner_id: input.partner_id,
              order_id: input.order_id,
              category: input.category,
              title: input.title,
              description: input.description,
              status: "open",
            })
            .select("*")
            .single();

          if (error) throw error;
          return { data, error };
        },
        {
          operation: "create",
          table: this.tableName,
          metadata: {
            partnerId: input.partner_id,
            orderId: input.order_id,
            category: input.category,
          },
          auditLog: {
            enabled: true,
            action: "INSERT",
            newValues: {
              partner_id: input.partner_id,
              order_id: input.order_id,
              category: input.category,
              title: input.title,
              status: "open",
            },
          },
        }
      );

      const attachments = input.attachments ?? [];
      if (attachments.length > 0) {
        await DatabaseWrapper.executeMutation(
          async () => {
            const { data, error } = await supabase
              .from("affiliate_claim_attachments")
              .insert(
                attachments.map((attachment) => ({
                  claim_id: created.id,
                  file_url: attachment.file_url,
                  file_name: attachment.file_name ?? null,
                  file_type: attachment.file_type ?? null,
                }))
              )
              .select("*");

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "createAttachments",
            table: "affiliate_claim_attachments",
            metadata: { claimId: created.id, count: attachments.length },
            auditLog: {
              enabled: true,
              action: "INSERT",
              newValues: {
                claim_id: created.id,
                count: attachments.length,
              },
            },
          }
        );
      }

      const claim = await this.getById(created.id);
      if (!claim) {
        throw new Error("Created claim could not be loaded");
      }
      return claim;
    });
  }

  async updateStatus(
    id: number,
    input: UpdateAffiliateClaimStatusInput
  ): Promise<AffiliateClaimEntity> {
    return withPerformanceTracking(
      "AffiliateClaimService",
      "updateStatus",
      async () => {
        const isTerminal =
          input.status === "resolved" || input.status === "rejected";

        await DatabaseWrapper.executeMutation(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .update({
                status: input.status,
                admin_notes: input.admin_notes ?? null,
                resolved_by: isTerminal ? input.resolved_by ?? null : null,
                resolved_at: isTerminal ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
              })
              .eq("id", id)
              .select("*")
              .single();

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "updateStatus",
            table: this.tableName,
            metadata: { id, status: input.status },
            auditLog: {
              enabled: true,
              action: "UPDATE",
              recordId: id,
              newValues: {
                status: input.status,
                admin_notes: input.admin_notes ?? null,
                resolved_by: isTerminal ? input.resolved_by ?? null : null,
              },
            },
          }
        );

        const claim = await this.getById(id);
        if (!claim) {
          throw new Error("Updated claim could not be loaded");
        }
        return claim;
      }
    );
  }

  private mapAttachment = (
    row: AttachmentRow
  ): AffiliateClaimAttachmentEntity => ({
    id: row.id,
    claim_id: row.claim_id,
    file_url: row.file_url,
    file_name: row.file_name ?? undefined,
    file_type: row.file_type ?? undefined,
    created_at: row.created_at,
  });

  private mapRowToEntity = (row: ClaimWithRelationsRow): AffiliateClaimEntity => {
    const customerName = [row.orders?.first_name, row.orders?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    return {
      id: row.id,
      partner_id: row.partner_id,
      order_id: row.order_id,
      category: row.category as AffiliateClaimCategory,
      title: row.title,
      description: row.description,
      status: row.status as AffiliateClaimStatus,
      admin_notes: row.admin_notes ?? undefined,
      resolved_by: row.resolved_by ?? undefined,
      resolved_at: row.resolved_at ?? undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
      attachments: (row.affiliate_claim_attachments ?? []).map(this.mapAttachment),
      partner_name: row.partners?.fullname ?? undefined,
      partner_email: row.partners?.email ?? undefined,
      partner_avatar: row.partners?.avatar ?? undefined,
      order_product: row.orders?.product ?? undefined,
      order_status: row.orders?.status ?? undefined,
      order_tracking_id: row.orders?.tracking_id ?? undefined,
      order_customer_name: customerName || undefined,
      order_phone: row.orders?.phone ?? undefined,
      order_wilaya: row.orders?.wilaya ?? undefined,
      order_commune: row.orders?.commune ?? undefined,
    };
  };
}
