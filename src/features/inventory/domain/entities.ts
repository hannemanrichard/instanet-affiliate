export interface InventoryRecord {
  id: number;
  item_id: number;
  quantity: number;
}

export interface InventoryWithItem {
  inventory: InventoryRecord;
  item?: {
    id: number;
    product_id?: number;
    product?: string;
    color?: string;
    colorHex?: string;
    size?: string;
    thumbnail?: string;
  };
}

export interface InventoryPhaseSummary {
  product_id: number;
  in_stock: number;
  ordered: number;
  in_delivery: number;
  delivered: number;
}

export interface InventoryAdjustmentInput {
  itemId: number;
  quantity: number;
}

export interface InventoryPhaseVariantDetail {
  itemId: string;
  size?: string;
  quantity: number;
}

export interface InventoryPhaseColorDetail {
  color: string;
  colorHex?: string;
  total: number;
  variants: InventoryPhaseVariantDetail[];
}

export type InventoryPhase = "ordered" | "in_delivery" | "delivered" | "other";

export interface InventoryPhaseDetailFilter {
  phases: InventoryPhase[];
  productName?: string;
}

export interface InventorySoldUnitsDateRange {
  fromDate: string;
  toDate: string;
}

export interface InventorySoldUnitsByProduct {
  key: string;
  value: number;
}

