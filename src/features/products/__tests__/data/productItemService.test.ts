import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import { SupabaseProductItemService } from "../../data/productItemService";

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

describe("SupabaseProductItemService", () => {
  let service: SupabaseProductItemService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SupabaseProductItemService();
    mockWithPerformanceTracking.mockImplementation(
      async (_className: string, _methodName: string, fn: any) => fn()
    );
  });

  describe("getByProductId", () => {
    it("maps items with inventory quantity", async () => {
      mockDatabaseWrapper.executeQuery.mockResolvedValue([
        {
          id: 1,
          product_id: 4,
          product: "Product A",
          color: "Red",
          color_hex: "#ff0000",
          size: "M",
          thumbnail: "thumb.jpg",
          cog: 50,
          created_at: "2024-01-01T00:00:00Z",
          inventory: {
            quantity: 12,
          },
        },
      ]);

      const result = await service.getByProductId(4);

      expect(result).toEqual([
        {
          id: 1,
          product_id: 4,
          product: "Product A",
          color: "Red",
          colorHex: "#ff0000",
          size: "M",
          thumbnail: "thumb.jpg",
          cog: 50,
          quantity: 12,
          created_at: "2024-01-01T00:00:00Z",
        },
      ]);
      expect(mockDatabaseWrapper.executeQuery).toHaveBeenCalled();
    });
  });

  describe("bulkUpdateQuantities", () => {
    it("skips execution when adjustments array is empty", async () => {
      await service.bulkUpdateQuantities(1, []);
      expect(mockDatabaseWrapper.executeMutation).not.toHaveBeenCalled();
    });

    it("calls mutation with rpc payload", async () => {
      mockDatabaseWrapper.executeMutation.mockResolvedValue({} as any);

      await service.bulkUpdateQuantities(2, [
        { itemId: 10, quantity: 5 },
        { itemId: 11, quantity: 8 },
      ]);

      expect(mockDatabaseWrapper.executeMutation).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          operation: "bulkUpdateProductInventory",
          table: "items",
          metadata: { productId: 2, adjustmentsCount: 2 },
        })
      );
    });
  });
});

