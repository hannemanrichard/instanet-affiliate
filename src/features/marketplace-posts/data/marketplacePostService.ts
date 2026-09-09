import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database, Json } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type {
  CreateMarketplacePostInput,
  MarketplacePostEntity,
  MarketplacePostStatus,
  UpdateMarketplacePostFromExtensionInput,
} from "../domain";
import type {
  MarketplacePostListFilters,
  MarketplacePostPagination,
  MarketplacePostRepository,
  PaginatedMarketplacePostsResult,
} from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type PostRow = Tables["affiliate_marketplace_posts"]["Row"];
type PartnerRow = Tables["partners"]["Row"];

type PostWithPartnerRow = PostRow & {
  partners?: Pick<PartnerRow, "fullname" | "avatar"> | null;
};

export class SupabaseMarketplacePostService
  implements MarketplacePostRepository
{
  private readonly tableName = "affiliate_marketplace_posts";

  async list(
    filters: MarketplacePostListFilters,
    pagination: MarketplacePostPagination
  ): Promise<PaginatedMarketplacePostsResult> {
    return withPerformanceTracking("MarketplacePostService", "list", async () => {
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
                  avatar
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
              rows: (data ?? []) as PostWithPartnerRow[],
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
        posts: rows.map(this.mapRowToEntity),
        total,
        page,
        limit,
      };
    });
  }

  async getById(id: number): Promise<MarketplacePostEntity | null> {
    return withPerformanceTracking("MarketplacePostService", "getById", async () => {
      const row = await DatabaseWrapper.executeQuery(
        async () => {
          const { data, error } = await supabase
            .from(this.tableName)
            .select(
              `
                *,
                partners (
                  fullname,
                  avatar
                )
              `
            )
            .eq("id", id)
            .maybeSingle();

          if (error) throw error;
          return { data: data as PostWithPartnerRow | null, error };
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

  async create(input: CreateMarketplacePostInput): Promise<MarketplacePostEntity> {
    return withPerformanceTracking("MarketplacePostService", "create", async () => {
      const created = await DatabaseWrapper.executeMutation(
        async () => {
          const { data, error } = await supabase
            .from(this.tableName)
            .insert({
              partner_id: input.partner_id,
              partner_email: input.partner_email,
              product_page_id: input.product_page_id,
              product_title: input.product_title,
              product_price: input.product_price,
              currency: input.currency ?? "DZD",
              status: "draft_opened",
              metadata: (input.metadata ?? {}) as Json,
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
            productPageId: input.product_page_id,
          },
          auditLog: {
            enabled: true,
            action: "INSERT",
            newValues: {
              partner_id: input.partner_id,
              product_page_id: input.product_page_id,
              status: "draft_opened",
            },
          },
        }
      );

      const post = await this.getById(created.id);
      if (!post) throw new Error("Created marketplace post could not be loaded");
      return post;
    });
  }

  async updateFromExtension(
    id: number,
    input: UpdateMarketplacePostFromExtensionInput
  ): Promise<MarketplacePostEntity> {
    return withPerformanceTracking(
      "MarketplacePostService",
      "updateFromExtension",
      async () => {
        const isPublished = input.status === "published";

        await DatabaseWrapper.executeMutation(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .update({
                status: input.status,
                location: input.location ?? null,
                marketplace_post_url: input.marketplace_post_url ?? null,
                extension_version: input.extension_version ?? null,
                error_message: input.error_message ?? null,
                metadata: (input.metadata ?? {}) as Json,
                published_at: isPublished ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
              })
              .eq("id", id)
              .select("*")
              .single();

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "updateFromExtension",
            table: this.tableName,
            metadata: { id, status: input.status },
            auditLog: {
              enabled: true,
              action: "UPDATE",
              recordId: id,
              newValues: {
                status: input.status,
                location: input.location ?? null,
                marketplace_post_url: input.marketplace_post_url ?? null,
              },
            },
          }
        );

        const post = await this.getById(id);
        if (!post) throw new Error("Updated marketplace post could not be loaded");
        return post;
      }
    );
  }

  private mapRowToEntity = (row: PostWithPartnerRow): MarketplacePostEntity => ({
    id: row.id,
    partner_id: row.partner_id,
    partner_email: row.partner_email,
    product_page_id: row.product_page_id,
    product_title: row.product_title,
    product_price: Number(row.product_price),
    currency: row.currency,
    location: row.location ?? undefined,
    status: row.status as MarketplacePostStatus,
    marketplace_post_url: row.marketplace_post_url ?? undefined,
    extension_version: row.extension_version ?? undefined,
    error_message: row.error_message ?? undefined,
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
    draft_opened_at: row.draft_opened_at,
    published_at: row.published_at ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    partner_name: row.partners?.fullname ?? undefined,
    partner_avatar: row.partners?.avatar ?? undefined,
  });
}
