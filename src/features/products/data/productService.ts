import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type {
  ProductCatalogEntry,
  ProductEntity,
  ProductInventorySnapshot,
} from "../domain";
import type { ProductRepository } from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type Views = Database["public"]["Views"];
type ProductRow = Tables["products"]["Row"];
type ProductInsert = Tables["products"]["Insert"];
type ProductUpdate = Tables["products"]["Update"];
type ProductCatalogRow = Views["products_catalog_view"]["Row"];
type ProductInventoryRow = Views["product_inventory_phases"]["Row"];

export class SupabaseProductService implements ProductRepository {
  private readonly tableName = "products";
  private readonly catalogView = "products_catalog_view";
  private readonly inventoryView = "product_inventory_phases";

  async getAll(): Promise<ProductEntity[]> {
    return withPerformanceTracking("ProductService", "getAll", async () => {
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

  async getById(id: number): Promise<ProductEntity | null> {
    return withPerformanceTracking("ProductService", "getById", async () => {
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
    });
  }

  async create(
    data: Omit<ProductEntity, "id" | "created_at" | "updated_at">
  ): Promise<ProductEntity> {
    return withPerformanceTracking("ProductService", "create", async () => {
      const payload: ProductInsert = {
        name: data.name,
        description: data.description ?? null,
        retail_price: data.retail_price,
        retail_price_2: data.retail_price_2 ?? null,
        retail_price_3: data.retail_price_3 ?? null,
        category: data.category ?? null,
        thumbnail: data.thumbnail ?? null,
        retail_commission: data.retail_commission ?? null,
        wholesale_price: data.wholesale_price ?? null,
        wholesale_commission: data.wholesale_commission ?? null,
        weight: data.weight ?? null,
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
          metadata: { name: data.name },
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
    data: Partial<ProductEntity>
  ): Promise<ProductEntity> {
    return withPerformanceTracking("ProductService", "update", async () => {
      const payload: ProductUpdate = {
        name: data.name,
        description: data.description ?? null,
        retail_price: data.retail_price ?? undefined,
        retail_price_2: data.retail_price_2 ?? undefined,
        retail_price_3: data.retail_price_3 ?? undefined,
        category: data.category ?? null,
        thumbnail: data.thumbnail ?? null,
        retail_commission: data.retail_commission ?? null,
        wholesale_price: data.wholesale_price ?? null,
        wholesale_commission: data.wholesale_commission ?? null,
        weight: data.weight ?? null,
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
    return withPerformanceTracking("ProductService", "delete", async () => {
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

  async search(term: string): Promise<ProductCatalogEntry[]> {
    if (!term) return [];

    return withPerformanceTracking("ProductService", "search", async () => {
      const rows = await DatabaseWrapper.executeQuery(
        async () => {
          const { data, error } = await supabase
            .from(this.catalogView)
            .select("*")
            .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
            .order("created_at", { ascending: false });

          if (error) throw error;
          return { data, error };
        },
        {
          operation: "search",
          table: this.catalogView,
          metadata: { term },
        }
      );

      return rows.map(this.mapCatalogRowToEntity);
    });
  }

  async getCatalog(): Promise<ProductCatalogEntry[]> {
    return withPerformanceTracking("ProductService", "getCatalog", async () => {
      const rows = await DatabaseWrapper.executeQuery(
        async () => {
          const { data, error } = await supabase
            .from(this.catalogView)
            .select("*")
            .order("created_at", { ascending: false });

          if (error) throw error;
          return { data, error };
        },
        {
          operation: "getCatalog",
          table: this.catalogView,
        }
      );

      return rows.map(this.mapCatalogRowToEntity);
    });
  }

  async getInventorySnapshot(
    productId: number
  ): Promise<ProductInventorySnapshot> {
    return withPerformanceTracking(
      "ProductService",
      "getInventorySnapshot",
      async () => {
        const row = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.inventoryView)
              .select("*")
              .eq("product_id", productId)
              .maybeSingle();

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "getInventorySnapshot",
            table: this.inventoryView,
            metadata: { productId },
          }
        );

        return this.mapInventoryRowToSnapshot(productId, row);
      }
    );
  }

  private mapRowToEntity = (row: ProductRow): ProductEntity => ({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    retail_price: row.retail_price ?? 0,
    retail_price_2: row.retail_price_2 ?? null,
    retail_price_3: row.retail_price_3 ?? null,
    category: row.category ?? undefined,
    thumbnail: row.thumbnail ?? undefined,
    retail_commission: row.retail_commission ?? undefined,
    wholesale_price: row.wholesale_price ?? undefined,
    wholesale_commission: row.wholesale_commission ?? undefined,
    weight: row.weight ?? undefined,
    created_at: row.created_at,
    updated_at: (row as { updated_at?: string }).updated_at,
  });

  private mapCatalogRowToEntity = (
    row: ProductCatalogRow
  ): ProductCatalogEntry => ({
    id: row.id ?? 0,
    name: row.name ?? "",
    description: row.description ?? undefined,
    price: row.price ?? undefined,
    total_stock: row.total_stock ?? undefined,
    primary_image: row.primary_image ?? undefined,
    category: row.category ?? undefined,
    created_at: row.created_at ?? undefined,
  });

  private mapInventoryRowToSnapshot = (
    productId: number,
    row: ProductInventoryRow | null
  ): ProductInventorySnapshot => ({
    product_id: productId,
    in_stock: row?.in_stock ?? 0,
    ordered: row?.ordered ?? 0,
    in_delivery: row?.in_delivery ?? 0,
    delivered: row?.delivered ?? 0,
  });
}
