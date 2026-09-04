import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import { SupabaseInventoryService } from "../../data/inventoryService";
import type { InventoryRecord } from "../../domain";

jest.mock("@/shared/utils/databaseWrapper");
jest.mock("@/shared/utils/performanceMonitor");
jest.mock("@/infrastructure/supabase/server", () => ({
  supabaseServer: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockDatabaseWrapper = DatabaseWrapper as jest.Mocked<typeof DatabaseWrapper>;
const mockWithPerformanceTracking = withPerformanceTracking as jest.MockedFunction<
  typeof withPerformanceTracking
>;

describe("SupabaseInventoryService", () => {
  let service: SupabaseInventoryService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SupabaseInventoryService();
    mockWithPerformanceTracking.mockImplementation(
      async (_className: string, _method: string, fn: any) => fn()
    );
  });

  it("maps inventory rows to entities", async () => {
    const rows = [
      {
        id: 1,
        item_id: 2,
        quantity: 10,
      },
    ];

    mockDatabaseWrapper.executeQuery.mockResolvedValue(rows as any);

    const result = await service.getAll();

    expect(result).toEqual([
      {
        id: 1,
        item_id: 2,
        quantity: 10,
      },
    ]);
  });

  it("returns inventory with item details by productId", async () => {
    mockDatabaseWrapper.executeQuery.mockResolvedValue([
      {
        id: 1,
        item_id: 3,
        quantity: 5,
        items: {
          id: 3,
          product_id: 10,
          product: "Bundle",
          color: "Red",
          color_hex: "#ff0000",
          size: "M",
          thumbnail: "thumb.jpg",
        },
      },
    ]);

    const result = await service.getByProductId(10);

    expect(result).toEqual([
      {
        inventory: { id: 1, item_id: 3, quantity: 5 },
        item: {
          id: 3,
          product_id: 10,
          product: "Bundle",
          color: "Red",
          colorHex: "#ff0000",
          size: "M",
          thumbnail: "thumb.jpg",
        },
      },
    ]);
  });

  it("updates quantity", async () => {
    const updated: InventoryRecord = { id: 1, item_id: 2, quantity: 15 };

    mockDatabaseWrapper.executeMutation.mockResolvedValue(updated as any);

    const result = await service.updateQuantity(1, 15);

    expect(result).toEqual(updated);
    expect(mockDatabaseWrapper.executeMutation).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        operation: "updateQuantity",
        table: "inventory",
      })
    );
  });

  it("returns phase summary", async () => {
    mockDatabaseWrapper.executeQuery
      .mockResolvedValueOnce({ name: null } as any)
      .mockResolvedValueOnce([
        { phase: "ordered", units: 5 },
        { phase: "in_delivery", units: 2 },
        { phase: "delivered", units: 10 },
      ] as any)
      .mockResolvedValueOnce([{ quantity: 20 }] as any);

    const summary = await service.getPhaseSummary(7);

    expect(summary).toEqual({
      product_id: 7,
      in_stock: 20,
      ordered: 5,
      in_delivery: 2,
      delivered: 10,
    });
  });

  it("returns sold units by product for date range", async () => {
    mockDatabaseWrapper.executeQuery.mockResolvedValue([
      { key: "product1", value: 12 },
      { key: "product2", value: 8 },
    ] as any);

    const result = await service.getNumberOfUnitsSoldByDateRange({
      fromDate: "2026-03-01",
      toDate: "2026-03-31",
    });

    expect(result).toEqual([
      { key: "product1", value: 12 },
      { key: "product2", value: 8 },
    ]);
  });
});

