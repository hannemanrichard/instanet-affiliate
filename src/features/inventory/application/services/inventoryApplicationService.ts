import { SupabaseInventoryService } from "../../data";
import type {
  InventoryAdjustmentInput,
  InventoryPhaseColorDetail,
  InventoryPhaseDetailFilter,
  InventoryPhaseSummary,
  InventoryRecord,
  InventorySoldUnitsByProduct,
  InventorySoldUnitsDateRange,
  InventoryWithItem,
} from "../../domain";
import { InventoryError } from "../../domain";
import type { InventoryRepository } from "../../domain/repositories";

export class InventoryApplicationService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async getInventoryByProduct(productId: number): Promise<InventoryWithItem[]> {
    try {
      return await this.inventoryRepository.getByProductId(productId);
    } catch {
      throw new InventoryError(
        "Failed to load inventory",
        "INVENTORY_FETCH_FAILED"
      );
    }
  }

  async getInventoryByItem(itemId: number): Promise<InventoryRecord | null> {
    try {
      return await this.inventoryRepository.getByItemId(itemId);
    } catch {
      throw new InventoryError(
        "Failed to load inventory record",
        "INVENTORY_FETCH_FAILED"
      );
    }
  }

  async getInventoryPhaseSummary(
    productId: number
  ): Promise<InventoryPhaseSummary> {
    try {
      return await this.inventoryRepository.getPhaseSummary(productId);
    } catch {
      throw new InventoryError(
        "Failed to load inventory phase summary",
        "INVENTORY_SUMMARY_FAILED"
      );
    }
  }

  async getInventoryPhaseDetails(
    productId: number,
    filter: InventoryPhaseDetailFilter
  ): Promise<InventoryPhaseColorDetail[]> {
    try {
      return await this.inventoryRepository.getPhaseDetails(productId, filter);
    } catch {
      throw new InventoryError(
        "Failed to load inventory phase details",
        "INVENTORY_PHASE_DETAILS_FAILED"
      );
    }
  }

  async getNumberOfUnitsSoldByDateRange(
    range: InventorySoldUnitsDateRange
  ): Promise<InventorySoldUnitsByProduct[]> {
    try {
      return await this.inventoryRepository.getNumberOfUnitsSoldByDateRange(
        range
      );
    } catch {
      throw new InventoryError(
        "Failed to load sold units for date range",
        "INVENTORY_SOLD_UNITS_FAILED"
      );
    }
  }

  async updateInventoryQuantity(
    id: number,
    quantity: number
  ): Promise<InventoryRecord> {
    try {
      return await this.inventoryRepository.updateQuantity(id, quantity);
    } catch {
      throw new InventoryError(
        "Failed to update quantity",
        "INVENTORY_UPDATE_FAILED"
      );
    }
  }

  async bulkAdjustProductInventory(
    productId: number,
    adjustments: InventoryAdjustmentInput[]
  ): Promise<InventoryPhaseSummary> {
    try {
      await this.inventoryRepository.bulkAdjustProduct(productId, adjustments);
      return await this.inventoryRepository.getPhaseSummary(productId);
    } catch {
      throw new InventoryError(
        "Failed to adjust inventory",
        "INVENTORY_BULK_UPDATE_FAILED"
      );
    }
  }

  async refreshPhaseDetailsView(): Promise<void> {
    try {
      await this.inventoryRepository.refreshPhaseDetailsView();
    } catch {
      throw new InventoryError(
        "Failed to refresh inventory phase details",
        "INVENTORY_REFRESH_FAILED"
      );
    }
  }
}

const inventoryService = new SupabaseInventoryService();

export const inventoryApplicationService = new InventoryApplicationService(
  inventoryService
);
