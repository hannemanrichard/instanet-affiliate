import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import { SupabaseOrderService } from "../../data/orderService";
import type { OrderEntity } from "../../domain";

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

describe("SupabaseOrderService", () => {
  let service: SupabaseOrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SupabaseOrderService();
    mockWithPerformanceTracking.mockImplementation(
      async (_className: string, _method: string, fn: any) => fn()
    );
  });

  describe("getAll", () => {
    it("maps order rows to entities", async () => {
      const rows = [
        {
          id: 1,
          first_name: "John",
          last_name: "Doe",
          phone: "123",
          product_qty: 2,
          has_defect: false,
          is_auto_delivered: false,
          is_exchange_required: false,
          return_processed: false,
        },
      ];

      mockDatabaseWrapper.executeQuery.mockResolvedValue(rows as any);

      const result = await service.getAll();

      expect(result).toEqual([
        {
          id: 1,
          status: undefined,
          first_name: "John",
          last_name: "Doe",
          phone: "123",
          phone2: undefined,
          address: undefined,
          commune: undefined,
          wilaya: undefined,
          channel: undefined,
          comment: undefined,
          objective: undefined,
          delivery_company: undefined,
          delivery_fees: undefined,
          delivery_notes: undefined,
          delivery_attempt: undefined,
          tracking_id: undefined,
          tracker_id: undefined,
          dc_recent_status: undefined,
          yalidine_status: undefined,
          agent_id: undefined,
          partner_id: undefined,
          product: undefined,
          product_color: undefined,
          product_size: undefined,
          product_price: undefined,
          product_qty: 2,
          shipping_price: undefined,
          is_auto_delivered: false,
          is_exchange_required: false,
          is_exchange: undefined,
          has_exchange: undefined,
          has_defect: false,
          is_free_shipping: undefined,
          is_stopdesk: undefined,
          is_wholesale: undefined,
          return_processed: false,
          stopdesk: undefined,
          created_at: undefined,
          modified_at: undefined,
        },
      ]);
    });
  });

  describe("create", () => {
    it("creates order and maps response", async () => {
      const payload: Omit<OrderEntity, "id"> = {
        status: "processing",
        first_name: "John",
        last_name: "Doe",
        phone: "123",
        phone2: undefined,
        address: undefined,
        commune: undefined,
        wilaya: undefined,
        channel: undefined,
        comment: undefined,
        objective: undefined,
        delivery_company: undefined,
        delivery_fees: undefined,
        delivery_notes: undefined,
        delivery_attempt: undefined,
        tracking_id: undefined,
        tracker_id: undefined,
        dc_recent_status: undefined,
        yalidine_status: undefined,
        agent_id: undefined,
        partner_id: undefined,
        product: undefined,
        product_color: undefined,
        product_size: undefined,
        product_price: undefined,
        product_qty: 1,
        shipping_price: undefined,
        is_auto_delivered: false,
        is_exchange_required: false,
        is_exchange: undefined,
        has_exchange: undefined,
        has_defect: false,
        is_free_shipping: undefined,
        is_stopdesk: undefined,
        is_wholesale: undefined,
        return_processed: false,
        stopdesk: undefined,
        created_at: undefined,
        modified_at: undefined,
      };

      const mockRow = {
        id: 10,
        ...payload,
      };

      mockDatabaseWrapper.executeMutation.mockResolvedValue(mockRow as any);

      const result = await service.create(payload);

      expect(result.id).toBe(10);
      expect(mockDatabaseWrapper.executeMutation).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          operation: "create",
          table: "orders",
        })
      );
    });
  });

  describe("getWithItems", () => {
    it("returns order with mapped items", async () => {
      mockDatabaseWrapper.executeQuery.mockResolvedValue({
        id: 5,
        product_qty: 1,
        has_defect: false,
        is_auto_delivered: false,
        is_exchange_required: false,
        return_processed: false,
        order_item: [
          {
            order_id: 5,
            item_id: 2,
            qty: 3,
            items: {
              id: 2,
              product_id: 7,
              product: "Bundle",
              color: "Black",
              size: "M",
              thumbnail: "thumb.jpg",
              cog: 50,
            },
          },
        ],
      });

      const result = await service.getWithItems(5);

      expect(result).toEqual({
        order: expect.objectContaining({ id: 5 }),
        items: [
          {
            order_id: 5,
            item_id: 2,
            qty: 3,
            product_page_id: undefined,
            item: {
              id: 2,
              product_id: 7,
              product: "Bundle",
              color: "Black",
              colorHex: undefined,
              size: "M",
              thumbnail: "thumb.jpg",
              cog: 50,
            },
          },
        ],
      });
    });
  });

  describe("getSummary", () => {
    it("maps SQL aggregate row to OrderSummary", async () => {
      mockDatabaseWrapper.executeQuery.mockResolvedValue([
        {
          total_orders: 2,
          total_processing: 1,
          total_delivered: 1,
          total_value: 350,
        },
      ]);

      const summary = await service.getSummary(42);

      expect(summary).toEqual({
        total_orders: 2,
        total_processing: 1,
        total_delivered: 1,
        total_value: 350,
      });
      expect(mockDatabaseWrapper.executeQuery).toHaveBeenCalled();
    });

    it("defaults missing aggregate row to zeros", async () => {
      mockDatabaseWrapper.executeQuery.mockResolvedValue([]);

      const summary = await service.getSummary();

      expect(summary).toEqual({
        total_orders: 0,
        total_processing: 0,
        total_delivered: 0,
        total_value: 0,
      });
    });
  });
});

