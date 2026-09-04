import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type { ProductPageItemEntity } from "../domain";
import type { ProductPageItemRepository } from "../domain/repositories";

export class SupabaseProductPageItemService implements ProductPageItemRepository {
  private readonly tableName = "product_page_items";

  async getByPageId(pageId: number): Promise<ProductPageItemEntity[]> {
    return withPerformanceTracking(
      "ProductPageItemService",
      "getByPageId",
      async () => {
        const rows = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select("*")
              .eq("product_page_id", pageId)
              .order("display_order", { ascending: true });

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "getByPageId",
            table: this.tableName,
            metadata: { pageId },
          }
        );

        return rows.map((row) => ({
          product_page_id: row.product_page_id,
          item_id: row.item_id,
          display_order: row.display_order ?? undefined,
        }));
      }
    );
  }

  async upsertItems(
    pageId: number,
    items: ProductPageItemEntity[]
  ): Promise<ProductPageItemEntity[]> {
    return withPerformanceTracking(
      "ProductPageItemService",
      "upsertItems",
      async () => {
        await DatabaseWrapper.executeMutation(
          async () => {
            const { error } = await supabase
              .from(this.tableName)
              .delete()
              .eq("product_page_id", pageId);

            if (error) throw error;
            return { data: { pageId }, error };
          },
          {
            operation: "deleteExistingPageItems",
            table: this.tableName,
            metadata: { pageId },
            auditLog: {
              enabled: true,
              action: "DELETE",
              recordId: pageId,
              oldValues: { pageId },
            },
          }
        );

        if (!items.length) return [];

        const rows = await DatabaseWrapper.executeMutation(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .insert(
                items.map((item, index) => ({
                  product_page_id: pageId,
                  item_id: item.item_id,
                  display_order:
                    item.display_order ?? index,
                }))
              )
              .select();

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "insertPageItems",
            table: this.tableName,
            metadata: { pageId, count: items.length },
            auditLog: {
              enabled: true,
              action: "INSERT",
              recordId: pageId,
              newValues: { items },
            },
          }
        );

        return rows.map((row) => ({
          product_page_id: row.product_page_id,
          item_id: row.item_id,
          display_order: row.display_order ?? undefined,
        }));
      }
    );
  }

  async deleteByPageId(pageId: number): Promise<void> {
    return withPerformanceTracking(
      "ProductPageItemService",
      "deleteByPageId",
      async () => {
        await DatabaseWrapper.executeMutation(
          async () => {
            const { error } = await supabase
              .from(this.tableName)
              .delete()
              .eq("product_page_id", pageId);

            if (error) throw error;
            return { data: { pageId }, error };
          },
          {
            operation: "deleteByPageId",
            table: this.tableName,
            metadata: { pageId },
            auditLog: {
              enabled: true,
              action: "DELETE",
              recordId: pageId,
            },
          }
        );
      }
    );
  }
}

