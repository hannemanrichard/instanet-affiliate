import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type { ProductPageImageEntity } from "../domain";
import type { ProductPageImageRepository } from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type ProductPageImageRow = Tables["product_page_images"]["Row"];
type ProductPageImageInsert = Tables["product_page_images"]["Insert"];

export class SupabaseProductPageImageService
  implements ProductPageImageRepository
{
  private readonly tableName = "product_page_images";

  async getByPageId(pageId: number): Promise<ProductPageImageEntity[]> {
    return withPerformanceTracking(
      "ProductPageImageService",
      "getByPageId",
      async () => {
        const rows = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select("*")
              .eq("product_page_id", pageId)
              .order("id", { ascending: true });

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "getByPageId",
            table: this.tableName,
            metadata: { pageId },
          }
        );

        return rows.map(this.mapRowToEntity);
      }
    );
  }

  async replaceForPage(
    pageId: number,
    urls: string[]
  ): Promise<ProductPageImageEntity[]> {
    return withPerformanceTracking(
      "ProductPageImageService",
      "replaceForPage",
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
            operation: "deleteExistingImages",
            table: this.tableName,
            metadata: { pageId },
            auditLog: {
              enabled: true,
              action: "DELETE",
              recordId: pageId,
            },
          }
        );

        if (!urls.length) {
          return [];
        }

        const payload: ProductPageImageInsert[] = urls.map((url) => ({
          product_page_id: pageId,
          url,
        }));

        const rows = await DatabaseWrapper.executeMutation(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .insert(payload)
              .select();

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "insertImages",
            table: this.tableName,
            metadata: { pageId, count: urls.length },
            auditLog: {
              enabled: true,
              action: "INSERT",
              recordId: pageId,
              newValues: { urls },
            },
          }
        );

        return rows.map(this.mapRowToEntity);
      }
    );
  }

  async deleteByPageId(pageId: number): Promise<void> {
    return withPerformanceTracking(
      "ProductPageImageService",
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

  private mapRowToEntity = (
    row: ProductPageImageRow
  ): ProductPageImageEntity => ({
    id: row.id,
    product_page_id: row.product_page_id,
    url: row.url,
  });
}

