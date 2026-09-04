import {
  useStandardMutation,
  useStandardQuery,
} from "@/shared/hooks/useReactQuery";
import { apiFetch } from "@/shared/utils/apiFetch";
import type {
  InventoryAdjustmentInput,
  InventoryPhaseColorDetail,
  InventoryPhaseDetailFilter,
  InventoryPhaseSummary,
  InventoryRecord,
  InventorySoldUnitsByProduct,
  InventorySoldUnitsDateRange,
  InventoryWithItem,
} from "../domain";

const inventoryKey = ["inventory"];
const productInventoryKey = (productId: number) => [
  ...inventoryKey,
  "product",
  productId.toString(),
];
const itemInventoryKey = (itemId: number) => [
  ...inventoryKey,
  "item",
  itemId.toString(),
];
const productPhaseKey = (productId: number) => [
  ...inventoryKey,
  "phases",
  productId.toString(),
];
const productPhaseDetailsKey = (
  productId: number,
  filter: InventoryPhaseDetailFilter
) => {
  return [
    ...inventoryKey,
    "phase-details",
    productId.toString(),
    JSON.stringify(filter),
  ];
};
const soldUnitsByDateRangeKey = (range: InventorySoldUnitsDateRange) => [
  ...inventoryKey,
  "sold-units",
  range.fromDate,
  range.toDate,
];

const buildPhaseDetailsQuery = (filter: InventoryPhaseDetailFilter) => {
  const params = new URLSearchParams();
  params.set("phases", filter.phases.join(","));
  if (filter.productName?.trim()) {
    params.set("productName", filter.productName.trim());
  }
  return params.toString();
};

export const useProductInventory = (productId: number) => {
  return useStandardQuery(
    productInventoryKey(productId),
    () =>
      apiFetch<{ inventory: InventoryWithItem[] }>(
        `/api/inventory/products/${productId}`
      ).then((d) => d.inventory),
    {
      enabled: productId > 0,
      staleTime: 30 * 1000,
    }
  );
};

export const useItemInventory = (itemId: number) => {
  return useStandardQuery(
    itemInventoryKey(itemId),
    () =>
      apiFetch<{ inventory: InventoryRecord | null }>(
        `/api/inventory/items/${itemId}`
      ).then((d) => d.inventory),
    {
      enabled: itemId > 0,
      staleTime: 30 * 1000,
    }
  );
};

export const useProductInventoryPhases = (productId: number) => {
  return useStandardQuery(
    productPhaseKey(productId),
    () =>
      apiFetch<{ summary: InventoryPhaseSummary }>(
        `/api/inventory/products/${productId}/phases`
      ).then((d) => d.summary),
    {
      enabled: productId > 0,
      staleTime: 30 * 1000,
    }
  );
};

export const useProductInventoryPhaseDetails = (
  productId: number,
  filter: InventoryPhaseDetailFilter
) => {
  return useStandardQuery(
    productPhaseDetailsKey(productId, filter),
    () =>
      apiFetch<{ details: InventoryPhaseColorDetail[] }>(
        `/api/inventory/products/${productId}/phase-details?${buildPhaseDetailsQuery(filter)}`
      ).then((d) => d.details),
    {
      enabled: productId > 0,
      staleTime: 30 * 1000,
      placeholderData: [],
    }
  );
};

export const useSoldUnitsByDateRange = (range: InventorySoldUnitsDateRange) => {
  const hasValidRange = Boolean(range.fromDate && range.toDate);
  return useStandardQuery(
    soldUnitsByDateRangeKey(range),
    () =>
      apiFetch<{ soldUnits: InventorySoldUnitsByProduct[] }>(
        `/api/inventory/sold-units?fromDate=${encodeURIComponent(range.fromDate)}&toDate=${encodeURIComponent(range.toDate)}`
      ).then((d) => d.soldUnits),
    {
      enabled: hasValidRange,
      staleTime: 30 * 1000,
    }
  );
};

export const useUpdateInventoryQuantity = () => {
  return useStandardMutation(
    ({ inventoryId, quantity }: { inventoryId: number; quantity: number }) =>
      apiFetch<{ inventory: InventoryRecord }>(
        `/api/inventory/${inventoryId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ quantity }),
        }
      ).then((d) => d.inventory),
    {
      invalidateQueries: [inventoryKey],
      successMessage: "Inventory updated",
      errorMessage: "Failed to update inventory",
    }
  );
};

export const useBulkAdjustInventory = () => {
  return useStandardMutation(
    ({
      productId,
      adjustments,
    }: {
      productId: number;
      adjustments: InventoryAdjustmentInput[];
    }) =>
      apiFetch<{ summary: InventoryPhaseSummary }>(
        `/api/inventory/products/${productId}/bulk-adjust`,
        {
          method: "POST",
          body: JSON.stringify({ adjustments }),
        }
      ).then((d) => d.summary),
    {
      invalidateQueries: [inventoryKey],
      successMessage: "Inventory adjusted",
      errorMessage: "Failed to adjust inventory",
    }
  );
};

export const useRefreshPhaseDetailsView = () => {
  return useStandardMutation(
    () =>
      apiFetch<{ success: boolean }>("/api/inventory/refresh-phase-details", {
        method: "POST",
      }),
    {
      invalidateQueries: [inventoryKey],
      successMessage: "Inventory phase details refreshed",
      errorMessage: "Failed to refresh inventory phase details",
    }
  );
};
