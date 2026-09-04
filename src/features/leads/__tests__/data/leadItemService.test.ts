import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import { SupabaseLeadItemService } from "../../data/leadItemService";

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

describe("SupabaseLeadItemService", () => {
  let service: SupabaseLeadItemService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SupabaseLeadItemService();
    mockWithPerformanceTracking.mockImplementation(
      async (_className: string, _method: string, fn: any) => fn()
    );
  });

  it("fetches items by lead", async () => {
    mockDatabaseWrapper.executeQuery.mockResolvedValue([
      { lead_id: 1, item_id: 2, qty: 3 },
    ]);

    const result = await service.getByLeadId(1);

    expect(result).toEqual([{ lead_id: 1, item_id: 2, qty: 3 }]);
    expect(mockDatabaseWrapper.executeQuery).toHaveBeenCalled();
  });

  it("creates multiple lead items", async () => {
    mockDatabaseWrapper.executeMutation.mockResolvedValue([
      { lead_id: 1, item_id: 3, qty: 4 },
    ] as any);

    const result = await service.createMany(1, [{ item_id: 3, qty: 4 }]);

    expect(result).toEqual([{ lead_id: 1, item_id: 3, qty: 4 }]);
    expect(mockDatabaseWrapper.executeMutation).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        operation: "createMany",
        table: "lead_item",
      })
    );
  });

  it("updates by replacing existing items", async () => {
    mockDatabaseWrapper.executeMutation
      .mockResolvedValueOnce({} as any)
      .mockResolvedValueOnce([{ lead_id: 1, item_id: 5, qty: 2 }] as any);

    const result = await service.updateMany(1, [{ item_id: 5, qty: 2 }]);

    expect(result).toEqual([{ lead_id: 1, item_id: 5, qty: 2 }]);
    expect(mockDatabaseWrapper.executeMutation).toHaveBeenCalledTimes(2);
  });
});

