import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database, Json } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type {
  ProductEntity,
  ProductItemEntity,
  ProductPageEntity,
  ProductPageHeroMedia,
  ProductPageImageEntity,
  ProductPageItemEntity,
  ProductPageTestimonialEntity,
  ProductPageWithRelations,
} from "../domain";
import type { ProductPageRepository } from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type ProductPageRow = Tables["product_pages"]["Row"];
type ProductPageInsert = Tables["product_pages"]["Insert"];
type ProductPageUpdate = Tables["product_pages"]["Update"];
type ProductRow = Tables["products"]["Row"];
type ProductPageItemRow = Tables["product_page_items"]["Row"];
type ProductPageImageRow = Tables["product_page_images"]["Row"];
type ProductPageTestimonialRow = Tables["product_page_testimonials"]["Row"];
type ItemRow = Tables["items"]["Row"];

type ProductPageWithJoins = ProductPageRow & {
  products?: ProductRow | null;
  product_page_items?: Array<
    ProductPageItemRow & {
      items?:
        | (ItemRow & {
            inventory?: {
              quantity: number | null;
            } | null;
          })
        | null;
    }
  > | null;
  product_page_images?: ProductPageImageRow[] | null;
  product_page_testimonials?: ProductPageTestimonialRow[] | null;
};

const serializeToJson = (value: unknown): Json =>
  JSON.parse(JSON.stringify(value)) as Json;

const serializeNullableJson = (
  value: unknown | null | undefined
): Json | null => {
  if (value === undefined || value === null) {
    return null;
  }
  return serializeToJson(value);
};

export class SupabaseProductPageService implements ProductPageRepository {
  private readonly tableName = "product_pages";

  async getAll(): Promise<ProductPageEntity[]> {
    return withPerformanceTracking("ProductPageService", "getAll", async () => {
      const rows = await DatabaseWrapper.executeQuery(
        async () => {
          const { data, error } = await supabase
            .from(this.tableName)
            .select("*")
            .order("created_at", { ascending: false });

          if (error) throw error;
          return { data, error };
        },
        {
          operation: "getAll",
          table: this.tableName,
        }
      );

      return rows.map(this.mapRowToEntity);
    });
  }

  async getActivePages(): Promise<ProductPageEntity[]> {
    return withPerformanceTracking(
      "ProductPageService",
      "getActivePages",
      async () => {
        const rows = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select("*")
              .eq("is_active", true)
              .eq("is_affiliate_friendly", true)
              .order("created_at", { ascending: false });

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "getActivePages",
            table: this.tableName,
          }
        );

        return rows.map(this.mapRowToEntity);
      }
    );
  }

  async getById(id: number): Promise<ProductPageEntity | null> {
    return withPerformanceTracking(
      "ProductPageService",
      "getById",
      async () => {
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

        if (!row) return null;
        return this.mapRowToEntity(row);
      }
    );
  }

  async getBySlug(slug: string): Promise<ProductPageWithRelations | null> {
    return withPerformanceTracking(
      "ProductPageService",
      "getBySlug",
      async () => {
        const row = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select(
                `
                  *,
                  products (*),
                  product_page_items (
                    display_order,
                    item_id,
                    product_page_id,
                    items (
                      *,
                      inventory (
                        quantity
                      )
                    )
                  ),
                  product_page_images (*),
                  product_page_testimonials (*)
                `
              )
              .eq("slug", slug)
              .maybeSingle<ProductPageWithJoins>();

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "getBySlug",
            table: this.tableName,
            metadata: { slug },
          }
        );

        if (!row) return null;

        return this.mapRowToRelations(row);
      }
    );
  }

  async create(
    data: Omit<ProductPageEntity, "id" | "created_at" | "updated_at">
  ): Promise<ProductPageEntity> {
    return withPerformanceTracking("ProductPageService", "create", async () => {
      const payload: ProductPageInsert = {
        product_id: data.product_id,
        slug: data.slug,
        headline: data.headline,
        subheadline: data.subheadline ?? null,
        description: data.description ?? null,
        hero_media: serializeToJson(data.hero_media ?? []),
        seo_metadata: serializeNullableJson(data.seo_metadata),
        is_active: data.is_active,
        is_affiliate_friendly: data.is_affiliate_friendly ?? false,
        is_freeshipping: data.is_freeshipping ?? false,
        promo_point: data.promo_point ?? 1,
        video_url: data.video_url ?? null,
      };

      const row = await DatabaseWrapper.executeMutation(
        async () => {
          const { data: created, error } = await supabase
            .from(this.tableName)
            .insert(payload)
            .select()
            .single();

          if (error) throw error;
          return { data: created, error };
        },
        {
          operation: "create",
          table: this.tableName,
          metadata: { slug: data.slug },
          auditLog: {
            enabled: true,
            action: "INSERT",
            newValues: payload,
          },
        }
      );

      return this.mapRowToEntity(row);
    });
  }

  async update(
    id: number,
    data: Partial<ProductPageEntity>
  ): Promise<ProductPageEntity> {
    return withPerformanceTracking("ProductPageService", "update", async () => {
      const payload: ProductPageUpdate = {
        product_id: data.product_id,
        slug: data.slug,
        headline: data.headline,
        subheadline: data.subheadline ?? null,
        description: data.description ?? null,
        hero_media:
          data.hero_media !== undefined
            ? serializeToJson(data.hero_media ?? [])
            : undefined,
        seo_metadata:
          data.seo_metadata !== undefined
            ? serializeNullableJson(data.seo_metadata)
            : undefined,
        is_active: data.is_active ?? undefined,
        is_affiliate_friendly:
          data.is_affiliate_friendly !== undefined
            ? data.is_affiliate_friendly
            : undefined,
        is_freeshipping:
          data.is_freeshipping !== undefined ? data.is_freeshipping : undefined,
        promo_point: data.promo_point ?? undefined,
        video_url:
          data.video_url !== undefined ? (data.video_url ?? null) : undefined,
        updated_at: new Date().toISOString(),
      };

      const row = await DatabaseWrapper.executeMutation(
        async () => {
          const { data: updated, error } = await supabase
            .from(this.tableName)
            .update(payload)
            .eq("id", id)
            .select()
            .single();

          if (error) throw error;
          return { data: updated, error };
        },
        {
          operation: "update",
          table: this.tableName,
          metadata: { id },
          auditLog: {
            enabled: true,
            action: "UPDATE",
            recordId: id,
            newValues: payload,
          },
        }
      );

      return this.mapRowToEntity(row);
    });
  }

  async delete(id: number): Promise<void> {
    return withPerformanceTracking("ProductPageService", "delete", async () => {
      await DatabaseWrapper.executeMutation(
        async () => {
          const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq("id", id);

          if (error) throw error;
          return { data: { id }, error };
        },
        {
          operation: "delete",
          table: this.tableName,
          metadata: { id },
          auditLog: {
            enabled: true,
            action: "DELETE",
            recordId: id,
          },
        }
      );
    });
  }

  async searchPages(term: string): Promise<ProductPageEntity[]> {
    if (!term) return [];

    return withPerformanceTracking(
      "ProductPageService",
      "searchPages",
      async () => {
        const rows = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select("*")
              .or(`slug.ilike.%${term}%,headline.ilike.%${term}%`)
              .order("created_at", { ascending: false });

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "searchPages",
            table: this.tableName,
            metadata: { term },
          }
        );

        return rows.map(this.mapRowToEntity);
      }
    );
  }

  private mapRowToEntity = (row: ProductPageRow): ProductPageEntity => ({
    id: row.id,
    product_id: row.product_id,
    slug: row.slug,
    headline: row.headline,
    subheadline: row.subheadline ?? undefined,
    description: row.description ?? undefined,
    hero_media: this.parseHeroMedia(row.hero_media),
    seo_metadata: this.parseSeoMetadata(row.seo_metadata),
    is_active: Boolean(row.is_active),
    is_affiliate_friendly: Boolean(row.is_affiliate_friendly),
    is_freeshipping: Boolean(row.is_freeshipping),
    promo_point: row.promo_point ?? 1,
    video_url: row.video_url ?? undefined,
    created_at: row.created_at ?? undefined,
    updated_at: row.updated_at ?? undefined,
  });

  private mapRowToRelations = (
    row: ProductPageWithJoins
  ): ProductPageWithRelations => {
    const page = this.mapRowToEntity(row);
    const product = this.mapProductRowToEntity(row.products);
    const pageItems = (row.product_page_items ?? []).map((item) =>
      this.mapPageItemRow(item)
    );
    const items = (row.product_page_items ?? [])
      .map((item) => item.items)
      .filter(
        (
          item
        ): item is ItemRow & {
          inventory?: { quantity: number | null } | null;
        } => Boolean(item)
      )
      .map(this.mapItemRowToEntity);
    const images = (row.product_page_images ?? [])
      .map(this.mapImageRowToEntity)
      .sort((a, b) => a.id - b.id);

    return {
      page,
      product,
      items,
      pageItems,
      images,
      testimonials: (row.product_page_testimonials ?? [])
        .map(this.mapTestimonialRowToEntity)
        .sort((a, b) => a.id - b.id),
      assets: [],
    };
  };

  private mapProductRowToEntity = (
    row: ProductRow | null | undefined
  ): ProductEntity => ({
    id: row?.id ?? 0,
    name: row?.name ?? "",
    description: row?.description ?? undefined,
    retail_price: row?.retail_price ?? 0,
    retail_price_2: row?.retail_price_2 ?? null,
    retail_price_3: row?.retail_price_3 ?? null,
    category: row?.category ?? undefined,
    thumbnail: row?.thumbnail ?? undefined,
    retail_commission: row?.retail_commission ?? undefined,
    wholesale_price: row?.wholesale_price ?? undefined,
    wholesale_commission: row?.wholesale_commission ?? undefined,
    weight: row?.weight ?? undefined,
    created_at: row?.created_at ?? "",
    updated_at: undefined,
  });

  private mapPageItemRow = (
    row: ProductPageItemRow
  ): ProductPageItemEntity => ({
    product_page_id: row.product_page_id,
    item_id: row.item_id,
    display_order: row.display_order ?? undefined,
  });

  private mapItemRowToEntity = (
    row: ItemRow & {
      inventory?: {
        quantity: number | null;
      } | null;
    }
  ): ProductItemEntity => ({
    id: row.id,
    product_id: row.product_id ?? 0,
    product: row.product ?? undefined,
    color: row.color ?? undefined,
    colorHex: (row as ItemRow & { color_hex?: string }).color_hex ?? undefined,
    size: row.size ?? undefined,
    thumbnail: row.thumbnail ?? undefined,
    cog: row.cog ?? undefined,
    quantity: row.inventory?.quantity ?? undefined,
    created_at: row.created_at ?? undefined,
  });

  private mapImageRowToEntity = (
    row: ProductPageImageRow
  ): ProductPageImageEntity => ({
    id: row.id,
    product_page_id: row.product_page_id,
    url: row.url,
  });

  private mapTestimonialRowToEntity = (
    row: ProductPageTestimonialRow
  ): ProductPageTestimonialEntity => ({
    id: row.id,
    product_page_id: row.product_page_id,
    url: row.url,
  });

  private parseHeroMediaEntry = (
    value: unknown
  ): ProductPageHeroMedia | null => {
    if (!value || typeof value !== "object") {
      return null;
    }

    const record = value as Record<string, unknown>;
    const url = record.url;
    if (typeof url !== "string" || url.length === 0) {
      return null;
    }

    return {
      url,
      alt_text:
        typeof record.alt_text === "string" ? record.alt_text : undefined,
      position:
        typeof record.position === "number" ? record.position : undefined,
      is_primary:
        typeof record.is_primary === "boolean" ? record.is_primary : undefined,
    };
  };

  private parseHeroMedia = (
    media: ProductPageRow["hero_media"]
  ): ProductPageHeroMedia[] => {
    if (!media) return [];

    if (Array.isArray(media)) {
      return media
        .map(this.parseHeroMediaEntry)
        .filter((entry): entry is ProductPageHeroMedia => entry !== null);
    }

    const single = this.parseHeroMediaEntry(media);
    return single ? [single] : [];
  };

  private parseSeoMetadata = (
    metadata: ProductPageRow["seo_metadata"]
  ): Record<string, unknown> | undefined => {
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      return undefined;
    }

    return JSON.parse(JSON.stringify(metadata)) as Record<string, unknown>;
  };
}
