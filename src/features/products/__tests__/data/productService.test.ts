import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import { SupabaseProductService } from "../../data/productService";
import type { ProductCatalogEntry, ProductEntity } from "../../domain";

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

describe("SupabaseProductService", () => {
  let service: SupabaseProductService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SupabaseProductService();
    mockWithPerformanceTracking.mockImplementation(
      async (_className: string, _method: string, fn: any) => fn()
    );
  });

  describe("getCatalog", () => {
    it("returns catalog entries mapped correctly", async () => {
      const mockCatalogRows: ProductCatalogEntry[] = [
        {
          id: 1,
          name: "Product A",
          description: "Great product",
          price: 199,
          total_stock: 25,
          primary_image: "image-url",
          category: "haircare",
          created_at: "2024-01-01T00:00:00Z",
        },
      ];

      mockDatabaseWrapper.executeQuery.mockResolvedValue(mockCatalogRows as any);

      const result = await service.getCatalog();

      expect(result).toEqual(mockCatalogRows);
      expect(mockDatabaseWrapper.executeQuery).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          operation: "getCatalog",
          table: "products_catalog_view",
        })
      );
    });
  });

  describe("getInventorySnapshot", () => {
    it("returns zero-filled snapshot when view has no data", async () => {
      mockDatabaseWrapper.executeQuery.mockResolvedValue(null);

      const snapshot = await service.getInventorySnapshot(10);

      expect(snapshot).toEqual({
        product_id: 10,
        in_stock: 0,
        ordered: 0,
        in_delivery: 0,
        delivered: 0,
      });
    });

    it("returns populated snapshot", async () => {
      mockDatabaseWrapper.executeQuery.mockResolvedValue({
        in_stock: 15,
        ordered: 2,
        in_delivery: 3,
        delivered: 8,
      });

      const snapshot = await service.getInventorySnapshot(5);

      expect(snapshot).toEqual({
        product_id: 5,
        in_stock: 15,
        ordered: 2,
        in_delivery: 3,
        delivered: 8,
      });
    });
  });

  describe("create", () => {
    it("creates a product and returns the mapped entity", async () => {
      const payload: Omit<ProductEntity, "id" | "created_at" | "updated_at"> = {
        name: "New Product",
        description: "Description",
        retail_price: 299,
        category: "haircare",
        thumbnail: "thumb.jpg",
        retail_commission: 10,
        wholesale_price: 150,
        wholesale_commission: 5,
        weight: 0.5,
      };

      const mockCreatedRow = {
        id: 123,
        ...payload,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      mockDatabaseWrapper.executeMutation.mockResolvedValue(mockCreatedRow as any);

      const result = await service.create(payload);

      expect(result).toEqual({
        id: 123,
        ...payload,
        retail_price_2: null,
        retail_price_3: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      });

      expect(mockDatabaseWrapper.executeMutation).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          operation: "create",
          table: "products",
          metadata: { name: payload.name },
        })
      );
    });
  });
});

