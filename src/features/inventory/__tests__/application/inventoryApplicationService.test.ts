import type {
  InventoryAdjustmentInput,
  InventoryPhaseSummary,
  InventoryRecord,
  InventoryWithItem,
} from "../../domain";
import { InventoryApplicationService } from "../../application/services/inventoryApplicationService";
import type { InventoryRepository } from "../../domain/repositories";

jest.mock("../../data", () => ({
  SupabaseInventoryService: jest.fn().mockImplementation(() => ({})),
}));

const createInventoryRepositoryMock = (): jest.Mocked<InventoryRepository> => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  getByItemId: jest.fn(),
  getByProductId: jest.fn(),
  createForItem: jest.fn(),
  updateQuantity: jest.fn(),
  bulkAdjustProduct: jest.fn(),
  getPhaseSummary: jest.fn(),
  getPhaseDetails: jest.fn(),
  getNumberOfUnitsSoldByDateRange: jest.fn(),
  refreshPhaseDetailsView: jest.fn(),
});

describe("InventoryApplicationService", () => {
  let repository: jest.Mocked<InventoryRepository>;
  let service: InventoryApplicationService;

  const baseRecord: InventoryRecord = {
    id: 1,
    item_id: 2,
    quantity: 10,
  };

  beforeEach(() => {
    repository = createInventoryRepositoryMock();
    service = new InventoryApplicationService(repository);
  });

  it("returns inventory by product", async () => {
    const inventory: InventoryWithItem[] = [
      {
        inventory: baseRecord,
        item: {
          id: 2,
          product_id: 5,
          product: "Bundle",
        },
      },
    ];

    repository.getByProductId.mockResolvedValue(inventory);

    const result = await service.getInventoryByProduct(5);

    expect(result).toEqual(inventory);
    expect(repository.getByProductId).toHaveBeenCalledWith(5);
  });

  it("returns inventory phase summary", async () => {
    const summary: InventoryPhaseSummary = {
      product_id: 5,
      in_stock: 20,
      ordered: 5,
      in_delivery: 3,
      delivered: 10,
    };

    repository.getPhaseSummary.mockResolvedValue(summary);

    const result = await service.getInventoryPhaseSummary(5);

    expect(result).toEqual(summary);
  });

  it("updates quantity via repository", async () => {
    repository.updateQuantity.mockResolvedValue(baseRecord);

    const result = await service.updateInventoryQuantity(1, 15);

    expect(repository.updateQuantity).toHaveBeenCalledWith(1, 15);
    expect(result).toEqual(baseRecord);
  });

  it("returns sold units by date range", async () => {
    repository.getNumberOfUnitsSoldByDateRange.mockResolvedValue([
      { key: "product1", value: 42 },
    ]);

    const result = await service.getNumberOfUnitsSoldByDateRange({
      fromDate: "2026-03-01",
      toDate: "2026-03-31",
    });

    expect(result).toEqual([{ key: "product1", value: 42 }]);
    expect(repository.getNumberOfUnitsSoldByDateRange).toHaveBeenCalledWith({
      fromDate: "2026-03-01",
      toDate: "2026-03-31",
    });
  });

  it("bulk adjusts inventory and returns updated summary", async () => {
    const summary: InventoryPhaseSummary = {
      product_id: 7,
      in_stock: 30,
      ordered: 4,
      in_delivery: 2,
      delivered: 12,
    };

    repository.getPhaseSummary.mockResolvedValue(summary);

    const adjustments: InventoryAdjustmentInput[] = [
      { itemId: 2, quantity: 5 },
      { itemId: 3, quantity: 10 },
    ];

    const result = await service.bulkAdjustProductInventory(7, adjustments);

    expect(repository.bulkAdjustProduct).toHaveBeenCalledWith(7, adjustments);
    expect(repository.getPhaseSummary).toHaveBeenCalledWith(7);
    expect(result).toEqual(summary);
  });
});

