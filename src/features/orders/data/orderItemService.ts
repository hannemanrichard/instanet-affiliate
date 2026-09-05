import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type {
  CreateOrderItemInput,
  OrderItemEntity,
  OrderItemProductDetails,
  UpdateOrderItemInput,
} from "../domain/entities";
import type { OrderItemRepository } from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type OrderItemRow = Tables["order_item"]["Row"];
type ItemRow = Tables["items"]["Row"];

type OrderItemWithDetails = OrderItemRow & {
  items?: ItemRow | null;
};

export class SupabaseOrderItemService implements OrderItemRepository {
  private readonly tableName = "order_item";

  async getByOrderId(orderId: number): Promise<OrderItemEntity[]> {
    return withPerformanceTracking(
      "OrderItemService",
      "getByOrderId",
      async () => {
        const rows = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select(
                `
                  *,
                  items (*)
                `
              )
              .eq("order_id", orderId);

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "getByOrderId",
            table: this.tableName,
            metadata: { orderId },
          }
        );

        return rows.map(this.mapRowToEntity);
      }
    );
  }

  async createMany(
    orderId: number,
    items: CreateOrderItemInput[],
    changedBy?: number
  ): Promise<OrderItemEntity[]> {
    if (!items.length) return [];

    return withPerformanceTracking(
      "OrderItemService",
      "createMany",
      async () => {
        const rows = await DatabaseWrapper.executeMutation(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .insert(
                items.map((item) => ({
                  order_id: orderId,
                  item_id: item.item_id,
                  qty: item.qty ?? null,
                  product_page_id: item.product_page_id ?? null,
                }))
              )
              .select(
                `
                  *,
                  items (*)
                `
              );

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "createMany",
            table: this.tableName,
            metadata: { orderId, count: items.length },
            auditLog: {
              enabled: true,
              action: "INSERT",
              recordId: orderId,
              changedBy,
              newValues: { items },
            },
          }
        );

        return rows.map(this.mapRowToEntity);
      }
    );
  }

  async updateMany(
    orderId: number,
    items: UpdateOrderItemInput[],
    changedBy?: number
  ): Promise<OrderItemEntity[]> {
    return withPerformanceTracking(
      "OrderItemService",
      "updateMany",
      async () => {
        await this.deleteByOrderId(orderId, changedBy);
        return this.createMany(
          orderId,
          items.map((item) => ({
            item_id: item.item_id,
            qty: item.qty,
            product_page_id: item.product_page_id,
          })),
          changedBy
        );
      }
    );
  }

  async deleteByOrderId(orderId: number, changedBy?: number): Promise<void> {
    return withPerformanceTracking(
      "OrderItemService",
      "deleteByOrderId",
      async () => {
        await DatabaseWrapper.executeMutation(
          async () => {
            const { error } = await supabase
              .from(this.tableName)
              .delete()
              .eq("order_id", orderId);

            if (error) throw error;
            return { data: { orderId }, error };
          },
          {
            operation: "deleteByOrderId",
            table: this.tableName,
            metadata: { orderId },
            auditLog: {
              enabled: true,
              action: "DELETE",
              recordId: orderId,
              changedBy,
            },
          }
        );
      }
    );
  }

  private mapRowToEntity = (row: OrderItemWithDetails): OrderItemEntity => ({
    order_id: row.order_id,
    item_id: row.item_id,
    qty: row.qty ?? undefined,
    product_page_id: row.product_page_id ?? undefined,
    item: row.items ? this.mapItemDetails(row.items) : undefined,
  });

  private mapItemDetails = (row: ItemRow): OrderItemProductDetails => ({
    id: row.id,
    product_id: row.product_id ?? undefined,
    product: row.product ?? undefined,
    color: row.color ?? undefined,
    size: row.size ?? undefined,
    thumbnail: row.thumbnail ?? undefined,
    cog: row.cog ?? undefined,
  });
}

