import type {
  InventoryAdjustmentInput,
  InventoryPhaseColorDetail,
  InventoryPhaseDetailFilter,
  InventoryPhaseSummary,
  InventoryRecord,
  InventorySoldUnitsByProduct,
  InventorySoldUnitsDateRange,
  InventoryWithItem,
} from "./entities";

export interface InventoryRepository {
  getAll(): Promise<InventoryRecord[]>;
  getById(id: number): Promise<InventoryRecord | null>;
  getByItemId(itemId: number): Promise<InventoryRecord | null>;
  getByProductId(productId: number): Promise<InventoryWithItem[]>;
  createForItem(itemId: number, quantity?: number): Promise<InventoryRecord>;
  updateQuantity(id: number, quantity: number): Promise<InventoryRecord>;
  bulkAdjustProduct(
    productId: number,
    adjustments: InventoryAdjustmentInput[]
  ): Promise<void>;
  getPhaseSummary(productId: number): Promise<InventoryPhaseSummary>;
  getPhaseDetails(
    productId: number,
    filter: InventoryPhaseDetailFilter
  ): Promise<InventoryPhaseColorDetail[]>;
  getNumberOfUnitsSoldByDateRange(
    range: InventorySoldUnitsDateRange
  ): Promise<InventorySoldUnitsByProduct[]>;
  refreshPhaseDetailsView(): Promise<void>;
}
