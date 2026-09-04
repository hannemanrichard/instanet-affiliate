import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type {
  InventoryAdjustmentInput,
  InventoryPhase,
  InventoryPhaseColorDetail,
  InventoryPhaseDetailFilter,
  InventoryPhaseSummary,
  InventoryPhaseVariantDetail,
  InventoryRecord,
  InventorySoldUnitsByProduct,
  InventorySoldUnitsDateRange,
  InventoryWithItem,
} from "../domain";
import type { InventoryRepository } from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type InventoryRow = Tables["inventory"]["Row"];
type InventoryInsert = Tables["inventory"]["Insert"];
type InventoryUpdate = Tables["inventory"]["Update"];
type ItemsRow = Tables["items"]["Row"];
type PhaseDetailRow =
  Database["public"]["Views"]["product_inventory_phase_details"]["Row"];

type InventoryWithItemRow = InventoryRow & {
  items?: ItemsRow | null;
};

export class SupabaseInventoryService implements InventoryRepository {
  private readonly tableName = "inventory";
  private readonly phaseDetailsView = "product_inventory_phase_details";

  async getAll(): Promise<InventoryRecord[]> {
    return withPerformanceTracking("InventoryService", "getAll", async () => {
      const rows = await DatabaseWrapper.executeQuery(
        async () => {
          const { data, error } = await supabase
            .from(this.tableName)
            .select("*");

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

  async getById(id: number): Promise<InventoryRecord | null> {
    return withPerformanceTracking("InventoryService", "getById", async () => {
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

  async getByItemId(itemId: number): Promise<InventoryRecord | null> {
    return withPerformanceTracking(
      "InventoryService",
      "getByItemId",
      async () => {
        const row = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select("*")
              .eq("item_id", itemId)
              .maybeSingle();

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "getByItemId",
            table: this.tableName,
            metadata: { itemId },
          }
        );

        return row ? this.mapRowToEntity(row) : null;
      }
    );
  }

  async getByProductId(productId: number): Promise<InventoryWithItem[]> {
    return withPerformanceTracking(
      "InventoryService",
      "getByProductId",
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
              .eq("items.product_id", productId);

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "getByProductId",
            table: this.tableName,
            metadata: { productId },
          }
        );

        return rows.map(this.mapInventoryWithItemRowToEntity);
      }
    );
  }

  async createForItem(itemId: number, quantity = 0): Promise<InventoryRecord> {
    return withPerformanceTracking(
      "InventoryService",
      "createForItem",
      async () => {
        const payload: InventoryInsert = {
          item_id: itemId,
          quantity,
        };

        const row = await DatabaseWrapper.executeMutation(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .insert(payload)
              .select("*")
              .single();

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "createForItem",
            table: this.tableName,
            metadata: { itemId, quantity },
            auditLog: {
              enabled: true,
              action: "INSERT",
              recordId: itemId,
              newValues: payload,
            },
          }
        );

        return this.mapRowToEntity(row);
      }
    );
  }

  async updateQuantity(id: number, quantity: number): Promise<InventoryRecord> {
    return withPerformanceTracking(
      "InventoryService",
      "updateQuantity",
      async () => {
        const payload: InventoryUpdate = {
          quantity,
        };

        const row = await DatabaseWrapper.executeMutation(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .update(payload)
              .eq("id", id)
              .select()
              .single();

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "updateQuantity",
            table: this.tableName,
            metadata: { id, quantity },
            auditLog: {
              enabled: true,
              action: "UPDATE",
              recordId: id,
              newValues: payload,
            },
          }
        );

        return this.mapRowToEntity(row);
      }
    );
  }

  async bulkAdjustProduct(
    productId: number,
    adjustments: InventoryAdjustmentInput[]
  ): Promise<void> {
    if (!adjustments.length) return;

    return withPerformanceTracking(
      "InventoryService",
      "bulkAdjustProduct",
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

            if (error) {
              throw this.normalizeSupabaseError(
                error,
                "Failed to bulk update inventory"
              );
            }
            return { data: { productId }, error };
          },
          {
            operation: "bulkAdjustProduct",
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

  async getPhaseSummary(productId: number): Promise<InventoryPhaseSummary> {
    return withPerformanceTracking(
      "InventoryService",
      "getPhaseSummary",
      async () => {
        const productName = await this.fetchProductName(productId);
        const [phaseRows, inStockQuantity] = await Promise.all([
          this.fetchPhaseDetailRows(productId, productName, [
            "ordered",
            "in_delivery",
            "delivered",
          ]),
          this.fetchInStockQuantity(productId),
        ]);

        const summaryByPhase = phaseRows.reduce<Record<InventoryPhase, number>>(
          (acc, row) => {
            const phase = (row.phase as InventoryPhase) ?? "other";
            if (!acc[phase]) acc[phase] = 0;
            acc[phase] += Number(row.units ?? 0);
            return acc;
          },
          {
            ordered: 0,
            in_delivery: 0,
            delivered: 0,
            other: 0,
          }
        );

        return {
          product_id: productId,
          in_stock: inStockQuantity,
          ordered: summaryByPhase.ordered,
          in_delivery: summaryByPhase.in_delivery,
          delivered: summaryByPhase.delivered,
        };
      }
    );
  }

  async getPhaseDetails(
    productId: number,
    filter: InventoryPhaseDetailFilter
  ): Promise<InventoryPhaseColorDetail[]> {
    return withPerformanceTracking(
      "InventoryService",
      "getPhaseDetails",
      async () => {
        const effectiveProductName =
          filter.productName && filter.productName.trim().length > 0
            ? filter.productName
            : await this.fetchProductName(productId);

        const rows = await this.fetchPhaseDetailRows(
          productId,
          effectiveProductName ?? undefined,
          filter.phases
        );

        return this.mapPhaseRowsToColorDetails(rows);
      }
    );
  }

  async getNumberOfUnitsSoldByDateRange(
    range: InventorySoldUnitsDateRange
  ): Promise<InventorySoldUnitsByProduct[]> {
    return withPerformanceTracking(
      "InventoryService",
      "getNumberOfUnitsSoldByDateRange",
      async () => {
        const rows = await DatabaseWrapper.executeQuery<
          Array<{ key: string; value: number | null }>
        >(
          async () => {
            const { data, error } = await supabase.rpc(
              "get_number_of_units_sold_by_daterange",
              {
                date1: range.fromDate,
                date2: range.toDate,
              }
            );

            if (error) {
              throw this.normalizeSupabaseError(
                error,
                "Failed to load units sold by date range"
              );
            }
            return { data, error };
          },
          {
            operation: "getNumberOfUnitsSoldByDateRange",
            table: this.tableName,
            metadata: {
              fromDate: range.fromDate,
              toDate: range.toDate,
            },
          }
        );

        return rows.map((row) => ({
          key: row.key,
          value: Number(row.value ?? 0),
        }));
      }
    );
  }

  private mapRowToEntity = (row: InventoryRow): InventoryRecord => ({
    id: row.id,
    item_id: row.item_id,
    quantity: row.quantity ?? 0,
  });

  private mapInventoryWithItemRowToEntity = (
    row: InventoryWithItemRow
  ): InventoryWithItem => ({
    inventory: this.mapRowToEntity(row),
    item: row.items
      ? {
          id: row.items.id,
          product_id: row.items.product_id ?? undefined,
          product: row.items.product ?? undefined,
          color: row.items.color ?? undefined,
          colorHex:
            (row.items as ItemsRow & { color_hex?: string }).color_hex ??
            undefined,
          size: row.items.size ?? undefined,
          thumbnail: row.items.thumbnail ?? undefined,
        }
      : undefined,
  });

  private mapPhaseRowsToColorDetails = (
    rows: PhaseDetailRow[]
  ): InventoryPhaseColorDetail[] => {
    const grouped = rows.reduce<
      Map<
        string,
        {
          color: string;
          colorHex?: string;
          variants: Map<string, InventoryPhaseVariantDetail>;
          total: number;
        }
      >
    >((acc, row) => {
      const normalizedColor = (row.color ?? "Unspecified").toLowerCase();
      if (
        !row.color ||
        normalizedColor === "unspecified" ||
        normalizedColor.length === 0
      ) {
        return acc;
      }
      const colorKey = normalizedColor;
      const quantity = Number(row.units ?? 0);
      if (!acc.has(colorKey)) {
        acc.set(colorKey, {
          color: row.color ?? "Unspecified",
          colorHex: row.color_hex ?? undefined,
          variants: new Map(),
          total: 0,
        });
      }

      const group = acc.get(colorKey)!;
      if (!group.colorHex && row.color_hex) {
        group.colorHex = row.color_hex ?? undefined;
      }
      group.total += quantity;

      const variantKey = `${row.color ?? "Unspecified"}-${row.size ?? "unsized"}`;
      const existing = group.variants.get(variantKey);
      if (existing) {
        existing.quantity += quantity;
      } else {
        group.variants.set(variantKey, {
          itemId: variantKey,
          size: row.size ?? undefined,
          quantity,
        });
      }

      return acc;
    }, new Map());

    return Array.from(grouped.values())
      .map((group) => ({
        color: group.color,
        colorHex: group.colorHex,
        total: group.total,
        variants: Array.from(group.variants.values()).sort((a, b) =>
          (a.size ?? "").localeCompare(b.size ?? "")
        ),
      }))
      .sort((a, b) => a.color.localeCompare(b.color));
  };

  private async fetchPhaseDetailRows(
    productId: number,
    productName: string | undefined,
    phases?: InventoryPhase[]
  ): Promise<PhaseDetailRow[]> {
    const rowsByProductId = await DatabaseWrapper.executeQuery<
      PhaseDetailRow[]
    >(
      async () => {
        let query = supabase
          .from(this.phaseDetailsView)
          .select("*")
          .eq("product_id", productId);

        if (phases && phases.length) {
          query =
            phases.length === 1
              ? query.eq("phase", phases[0])
              : query.in("phase", phases);
        }

        const { data, error } = await query;
        if (error) throw error;
        return { data, error };
      },
      {
        operation: "fetchPhaseDetailsByProductId",
        table: this.phaseDetailsView,
        metadata: { productId, phases },
      }
    );

    if (!productName?.trim()) {
      return rowsByProductId;
    }

    const lowercaseName = productName.trim().toLowerCase();

    const rowsByName = await DatabaseWrapper.executeQuery<PhaseDetailRow[]>(
      async () => {
        let query = supabase
          .from(this.phaseDetailsView)
          .select("*")
          .eq("product_name", lowercaseName);

        if (phases && phases.length) {
          query =
            phases.length === 1
              ? query.eq("phase", phases[0])
              : query.in("phase", phases);
        }

        const { data, error } = await query;
        if (error) throw error;
        return { data, error };
      },
      {
        operation: "fetchPhaseDetailsByProductName",
        table: this.phaseDetailsView,
        metadata: { productName: lowercaseName, phases },
      }
    );

    const dedupedMap = new Map<string, PhaseDetailRow>();
    [...rowsByProductId, ...rowsByName].forEach((row) => {
      const key = `${row.product_id ?? "null"}-${row.product_name ?? ""}-${row.phase ?? ""}-${row.color ?? ""}-${row.size ?? ""}`;
      dedupedMap.set(key, row);
    });

    return Array.from(dedupedMap.values());
  }

  private async fetchProductName(
    productId: number
  ): Promise<string | undefined> {
    const row = await DatabaseWrapper.executeQuery<{
      name: string | null;
    } | null>(
      async () => {
        const { data, error } = await supabase
          .from("products")
          .select("name")
          .eq("id", productId)
          .maybeSingle();

        if (error) throw error;
        return { data, error };
      },
      {
        operation: "fetchProductName",
        table: "products",
        metadata: { productId },
      }
    );

    return row?.name ?? undefined;
  }

  private normalizeSupabaseError(
    error: unknown,
    fallbackMessage: string
  ): Error {
    if (error instanceof Error) {
      return error;
    }

    const message =
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message.trim().length
        ? error.message
        : typeof error === "object" &&
            error !== null &&
            "details" in error &&
            typeof error.details === "string" &&
            error.details.trim().length
          ? error.details
          : fallbackMessage;

    return new Error(message);
  }

  async refreshPhaseDetailsView(): Promise<void> {
    return withPerformanceTracking(
      "InventoryService",
      "refreshPhaseDetailsView",
      async () => {
        await DatabaseWrapper.executeQuery(
          async () => {
            const { error } = await supabase.rpc(
              "refresh_product_inventory_phase_details"
            );

            if (error) {
              throw this.normalizeSupabaseError(
                error,
                "Failed to refresh inventory phase details view"
              );
            }
            return { data: null, error };
          },
          {
            operation: "refreshPhaseDetailsView",
            table: this.phaseDetailsView,
          }
        );
      }
    );
  }

  private async fetchInStockQuantity(productId: number): Promise<number> {
    const rows = await DatabaseWrapper.executeQuery<
      Array<{ quantity: number | null }>
    >(
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select("quantity, items!inner(product_id)")
          .eq("items.product_id", productId);

        if (error) throw error;
        return { data, error };
      },
      {
        operation: "fetchInStockQuantity",
        table: this.tableName,
        metadata: { productId },
      }
    );

    return rows.reduce((acc, row) => acc + (row.quantity ?? 0), 0);
  }
}
