import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import { SupabaseOrderItemService } from "../../data/orderItemService";

jest.mock("@/shared/utils/databaseWrapper");
jest.mock("@/shared/utils/performanceMonitor");
jest.mock("@/infrastructure/supabase/server", () => ({
  supabaseServer: {
    from: jest.fn(),
  },
}));

const mockDatabaseWrapper = DatabaseWrapper as jest.Mocked<typeof DatabaseWrapper>;
const mockWithPerformanceTracking = withPerformanceTracking as jest.MockedFunction<
  typeof withPerformanceTracking
>;

describe("SupabaseOrderItemService", () => {
  let service: SupabaseOrderItemService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SupabaseOrderItemService();
    mockWithPerformanceTracking.mockImplementation(
      async (_className: string, _method: string, fn: any) => fn()
    );
  });

  it("maps items with joined product details", async () => {
    mockDatabaseWrapper.executeQuery.mockResolvedValue([
      {
        order_id: 1,
        item_id: 10,
        qty: 2,
        product_page_id: 9,
        items: {
          id: 10,
          product_id: 3,
          product: "Bundle",
          color: "Red",
          size: "L",
          thumbnail: "thumb.jpg",
          cog: 40,
        },
      },
    ]);

    const result = await service.getByOrderId(1);

    expect(result).toEqual([
      {
        order_id: 1,
        item_id: 10,
        qty: 2,
        product_page_id: 9,
        item: {
          id: 10,
          product_id: 3,
          product: "Bundle",
          color: "Red",
          size: "L",
          thumbnail: "thumb.jpg",
          cog: 40,
        },
      },
    ]);
  });

  it("creates many items", async () => {
    mockDatabaseWrapper.executeMutation.mockResolvedValue([
      {
        order_id: 2,
        item_id: 11,
        qty: 5,
        items: null,
      },
    ] as any);

    const result = await service.createMany(2, [
      { item_id: 11, qty: 5, product_page_id: 12 },
    ]);

    expect(result).toEqual([
      {
        order_id: 2,
        item_id: 11,
        qty: 5,
        product_page_id: undefined,
        item: undefined,
      },
    ]);
    expect(mockDatabaseWrapper.executeMutation).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        operation: "createMany",
        table: "order_item",
      })
    );
  });

  it("updates items by replacing records", async () => {
    mockDatabaseWrapper.executeMutation
      .mockResolvedValueOnce({} as any)
      .mockResolvedValueOnce([
        {
          order_id: 3,
          item_id: 15,
          qty: 1,
          items: null,
        },
      ] as any);

    const result = await service.updateMany(3, [{ item_id: 15, qty: 1 }]);

    expect(result).toEqual([
      {
        order_id: 3,
        item_id: 15,
        qty: 1,
        product_page_id: undefined,
        item: undefined,
      },
    ]);
    expect(mockDatabaseWrapper.executeMutation).toHaveBeenCalledTimes(2);
  });
});

