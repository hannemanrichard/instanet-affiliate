import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import { SupabaseLeadService } from "../../data/leadService";
import type { LeadEntity } from "../../domain";

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

describe("SupabaseLeadService", () => {
  let service: SupabaseLeadService;

  const baseRow = {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    phone: "123",
    product_qty: undefined,
    has_recourse: false,
    is_abondoned: false,
    is_moved: false,
    is_wholesale: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SupabaseLeadService();
    mockWithPerformanceTracking.mockImplementation(
      async (_className: string, _method: string, fn: any) => fn()
    );
  });

  it("returns all leads mapped to entities", async () => {
    mockDatabaseWrapper.executeQuery.mockResolvedValue([baseRow] as any);

    const result = await service.getAll();

    expect(result).toEqual([
      {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        phone: "123",
        address: undefined,
        commune: undefined,
        wilaya: undefined,
        channel: undefined,
        comment: undefined,
        color: undefined,
        size: undefined,
        product: undefined,
        status: undefined,
        objective: undefined,
        offer: undefined,
        agent_id: undefined,
        partner_id: undefined,
        created_at: undefined,
        last_changed_status: undefined,
        has_recourse: false,
        is_abondoned: false,
        is_moved: false,
        is_wholesale: false,
      },
    ]);
  });

  it("creates a lead and maps response", async () => {
    const payload: Omit<LeadEntity, "id"> = {
      first_name: "Jane",
      last_name: "Smith",
      phone: "555-1234",
      address: undefined,
      commune: undefined,
      wilaya: undefined,
      channel: undefined,
      comment: undefined,
      color: undefined,
      size: undefined,
      product: undefined,
      status: "new",
      objective: undefined,
      offer: undefined,
      agent_id: undefined,
      partner_id: undefined,
      created_at: undefined,
      last_changed_status: undefined,
      has_recourse: undefined,
      is_abondoned: undefined,
      is_moved: undefined,
      is_wholesale: undefined,
    };

    mockDatabaseWrapper.executeMutation.mockResolvedValue({
      id: 10,
      ...payload,
    } as any);

    const result = await service.create(payload);

    expect(result.id).toBe(10);
    expect(mockDatabaseWrapper.executeMutation).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        operation: "create",
        table: "leads",
      })
    );
  });

  it("returns lead with items", async () => {
    mockDatabaseWrapper.executeQuery.mockResolvedValue({
      ...baseRow,
      lead_item: [
        {
          lead_id: 1,
          item_id: 2,
          qty: 3,
        },
      ],
    });

    const result = await service.getWithItems(1);

    expect(result).toEqual({
      lead: expect.objectContaining({ id: 1 }),
      items: [
        {
          lead_id: 1,
          item_id: 2,
          qty: 3,
        },
      ],
    });
  });

  it("aggregates summary metrics", async () => {
    mockDatabaseWrapper.executeQuery.mockResolvedValue([
      { status: "new", is_wholesale: false },
      { status: "converted", is_wholesale: true },
    ]);

    const summary = await service.getSummary();

    expect(summary).toEqual({
      total_leads: 2,
      total_pending: 1,
      total_confirmed: 1,
      total_wholesale: 1,
    });
  });
});

