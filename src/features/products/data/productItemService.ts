import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type { ProductInventoryAdjustment, ProductItemEntity } from "../domain";
import type { ProductItemRepository } from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type ProductItemRow = Tables["items"]["Row"];
type ProductItemInsert = Tables["items"]["Insert"];
type ProductItemUpdate = Tables["items"]["Update"];

interface ItemWithInventory extends ProductItemRow {
  inventory?: {
    quantity: number | null;
  } | null;
}

export class SupabaseProductItemService implements ProductItemRepository {
  private readonly tableName = "items";

  async getByProductId(productId: number): Promise<ProductItemEntity[]> {
    return withPerformanceTracking(
      "ProductItemService",
      "getByProductId",
      async () => {
        const rows = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select(
                `
                  *,
                  inventory (
                    quantity
                  )
                `
              )
              .eq("product_id", productId)
              .order("created_at", { ascending: true });

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "getByProductId",
            table: this.tableName,
            metadata: { productId },
          }
        );

        return rows.map(this.mapRowToEntity);
      }
    );
  }

  async getById(itemId: number): Promise<ProductItemEntity | null> {
    return withPerformanceTracking(
      "ProductItemService",
      "getById",
      async () => {
        const row = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select(
                `
                  *,
                  inventory (
                    quantity
                  )
                `
              )
              .eq("id", itemId)
              .maybeSingle();

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "getById",
            table: this.tableName,
            metadata: { itemId },
          }
        );

        if (!row) return null;
        return this.mapRowToEntity(row);
      }
    );
  }

  async create(
    data: Omit<ProductItemEntity, "id" | "quantity">
  ): Promise<ProductItemEntity> {
    return withPerformanceTracking("ProductItemService", "create", async () => {
      const payload: ProductItemInsert = {
        product_id: data.product_id,
        product: data.product ?? null,
        color: data.color ?? null,
        color_hex: data.colorHex ?? null,
        size: data.size ?? null,
        thumbnail: data.thumbnail ?? null,
        cog: data.cog ?? null,
      };

      const row = await DatabaseWrapper.executeMutation(
        async () => {
          const { data: created, error } = await supabase
            .from(this.tableName)
            .insert(payload)
            .select(
              `
                  *,
                  inventory (
                    quantity
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
          metadata: { product_id: data.product_id },
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
    data: Partial<ProductItemEntity>
  ): Promise<ProductItemEntity> {
    return withPerformanceTracking("ProductItemService", "update", async () => {
      const payload: ProductItemUpdate = {
        product_id: data.product_id,
        product: data.product ?? null,
        color: data.color ?? null,
        color_hex: data.colorHex ?? null,
        size: data.size ?? null,
        thumbnail: data.thumbnail ?? null,
        cog: data.cog ?? null,
      };

      const row = await DatabaseWrapper.executeMutation(
        async () => {
          const { data: updated, error } = await supabase
            .from(this.tableName)
            .update(payload)
            .eq("id", id)
            .select(
              `
                  *,
                  inventory (
                    quantity
                  )
                `
            )
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
    return withPerformanceTracking("ProductItemService", "delete", async () => {
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

  async bulkUpdateQuantities(
    productId: number,
    adjustments: ProductInventoryAdjustment[]
  ): Promise<void> {
    if (!adjustments.length) return;

    return withPerformanceTracking(
      "ProductItemService",
      "bulkUpdateQuantities",
      async () => {
        await DatabaseWrapper.executeMutation(
          async () => {
            const { error } = await supabase.rpc(
              "bulk_update_product_inventory",
              {
                product_id_in: productId,
                adjustments_in: adjustments.map((adjustment) => ({
                  item_id: adjustment.itemId,
                  quantity: adjustment.quantity,
                })),
              }
            );

            if (error) throw error;
            return { data: { productId }, error };
          },
          {
            operation: "bulkUpdateProductInventory",
            table: this.tableName,
            metadata: { productId, adjustmentsCount: adjustments.length },
            auditLog: {
              enabled: true,
              action: "UPDATE",
              recordId: productId,
              newValues: { adjustments },
            },
          }
        );
      }
    );
  }

  async ensureInventory(itemId: number, quantity = 0): Promise<void> {
    return withPerformanceTracking(
      "ProductItemService",
      "ensureInventory",
      async () => {
        await DatabaseWrapper.executeMutation(
          async () => {
            const { error } = await supabase.from("inventory").insert({
              item_id: itemId,
              quantity,
            });

            if (error) throw error;
            return { data: { itemId, quantity }, error };
          },
          {
            operation: "ensureInventory",
            table: "inventory",
            metadata: { itemId, quantity },
            auditLog: {
              enabled: true,
              action: "INSERT",
              recordId: itemId,
            },
          }
        );
      }
    );
  }

  private mapRowToEntity = (row: ItemWithInventory): ProductItemEntity => ({
    id: row.id,
    product_id: row.product_id ?? 0,
    product: row.product ?? undefined,
    color: row.color ?? undefined,
    colorHex: (row as ProductItemRow & { color_hex?: string }).color_hex ?? undefined,
    size: row.size ?? undefined,
    thumbnail: row.thumbnail ?? undefined,
    cog: row.cog ?? undefined,
    quantity: row.inventory?.quantity ?? undefined,
    created_at: row.created_at ?? undefined,
  });
}
