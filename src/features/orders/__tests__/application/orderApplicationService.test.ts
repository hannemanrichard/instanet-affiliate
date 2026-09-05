import type {
  CreateOrderInput,
  OrderEntity,
  OrderSummary,
  OrderWithItems,
} from "../../domain";
import {
  OrderApplicationService,
  type CreateOrderPayload,
} from "../../application/services/orderApplicationService";
import type {
  OrderItemRepository,
  OrderRepository,
} from "../../domain/repositories";
import type { CommissionRepository } from "@/features/earnings/domain/repositories";
import type { ProductRepository } from "@/features/products/domain/repositories";
import type { ProductEntity } from "@/features/products/domain";
import type { DeliveryParcelGateway } from "@/features/delivery";

const createOrderRepositoryMock = (): jest.Mocked<OrderRepository> => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  getByStatus: jest.fn(),
  search: jest.fn(),
  getPaginated: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getWithItems: jest.fn(),
  getSummary: jest.fn(),
});

const createOrderItemRepositoryMock = (): jest.Mocked<OrderItemRepository> => ({
  getByOrderId: jest.fn(),
  createMany: jest.fn(),
  updateMany: jest.fn(),
  deleteByOrderId: jest.fn(),
});

const createCommissionRepositoryMock = (): jest.Mocked<CommissionRepository> => ({
  create: jest.fn(),
  getByOrderId: jest.fn(),
  getByPartnerId: jest.fn(),
  markEarnedByOrderId: jest.fn(),
});

const createProductRepositoryMock = (): jest.Mocked<ProductRepository> => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  search: jest.fn(),
  getCatalog: jest.fn(),
  getInventorySnapshot: jest.fn(),
});

const createDeliveryParcelGatewayMock =
  (): jest.Mocked<DeliveryParcelGateway> => ({
    createParcel: jest.fn(),
  });

describe("OrderApplicationService", () => {
  let orderRepository: jest.Mocked<OrderRepository>;
  let orderItemRepository: jest.Mocked<OrderItemRepository>;
  let commissionRepository: jest.Mocked<CommissionRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let deliveryParcelGateway: jest.Mocked<DeliveryParcelGateway>;
  let service: OrderApplicationService;

  const baseOrder: OrderEntity = {
    id: 1,
    status: "processing",
    first_name: "John",
    last_name: "Doe",
    phone: "0550123456",
    phone2: undefined,
    address: "Street 1",
    commune: "Bab El Assa",
    wilaya: "Tlemcen",
    channel: undefined,
    comment: undefined,
    objective: undefined,
    delivery_company: undefined,
    delivery_fees: 700,
    delivery_notes: undefined,
    delivery_attempt: undefined,
    tracking_id: undefined,
    tracker_id: undefined,
    parcel_id: undefined,
    dc_recent_status: undefined,
    yalidine_status: undefined,
    agent_id: undefined,
    partner_id: 42,
    product: "Serum",
    product_color: undefined,
    product_size: undefined,
    product_price: 5000,
    product_qty: 2,
    shipping_price: undefined,
    is_auto_delivered: false,
    is_exchange_required: false,
    is_exchange: undefined,
    has_exchange: undefined,
    has_defect: false,
    is_free_shipping: undefined,
    is_stopdesk: false,
    is_wholesale: false,
    return_processed: false,
    stopdesk: undefined,
    created_at: undefined,
    modified_at: undefined,
  };

  const product: ProductEntity = {
    id: 10,
    name: "Serum",
    retail_price: 5000,
    retail_commission: 500,
    wholesale_commission: 300,
    created_at: "2026-01-01",
  };

  const deliveryLocation = {
    wilayaId: "981f136a-996f-463e-a536-8e643daab193",
    communeId: "4d3c708d-443e-430c-9e8c-00264b2e4575",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    orderRepository = createOrderRepositoryMock();
    orderItemRepository = createOrderItemRepositoryMock();
    commissionRepository = createCommissionRepositoryMock();
    productRepository = createProductRepositoryMock();
    deliveryParcelGateway = createDeliveryParcelGatewayMock();
    service = new OrderApplicationService(
      orderRepository,
      orderItemRepository,
      commissionRepository,
      productRepository,
      deliveryParcelGateway
    );
  });

  describe("getOrders", () => {
    it("returns orders by status when provided", async () => {
      const orders: OrderEntity[] = [baseOrder];
      orderRepository.getByStatus.mockResolvedValue(orders);

      const result = await service.getOrders({
        status: "processing",
        partnerId: 42,
      });

      expect(orderRepository.getByStatus).toHaveBeenCalledWith("processing", 42);
      expect(result).toEqual(orders);
    });

    it("searches orders when search term provided", async () => {
      orderRepository.search.mockResolvedValue([baseOrder]);

      await service.getOrders({ search: "john", partnerId: 42 });

      expect(orderRepository.search).toHaveBeenCalledWith("john", 42);
    });
  });

  describe("getPaginatedOrders", () => {
    it("requires partner id", async () => {
      await expect(
        service.getPaginatedOrders({}, { page: 1, limit: 10 })
      ).rejects.toMatchObject({ code: "ORDER_PARTNER_REQUIRED" });
    });

    it("returns paginated orders for partner", async () => {
      orderRepository.getPaginated.mockResolvedValue({
        data: [baseOrder],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.getPaginatedOrders(
        { partnerId: 42, status: "initial" },
        { page: 1, limit: 10 }
      );

      expect(orderRepository.getPaginated).toHaveBeenCalledWith(
        { partnerId: 42, status: "initial" },
        { page: 1, limit: 10 }
      );
      expect(result.total).toBe(1);
    });
  });

  describe("createOrder", () => {
    it("creates order, items, commission snapshot, and ZR parcel", async () => {
      const payload: CreateOrderPayload = {
        order: {
          ...baseOrder,
          id: undefined as unknown as number,
          product_price: 1,
          delivery_fees: 2,
          shipping_price: 3,
        } as CreateOrderInput,
        items: [
          {
            item_id: 10,
            qty: 2,
            product_page_id: 12,
          },
        ],
        productId: 10,
        deliveryLocation,
      };

      const orderWithParcel: OrderEntity = {
        ...baseOrder,
        delivery_company: "zr",
        parcel_id: "parcel-uuid",
        tracking_id: "16-ABC-ZR",
      };

      orderRepository.create.mockResolvedValue(baseOrder);
      orderItemRepository.createMany.mockResolvedValue([
        {
          order_id: 1,
          item_id: 10,
          qty: 2,
          item: undefined,
        },
      ]);
      productRepository.getById.mockResolvedValue(product);
      commissionRepository.create.mockResolvedValue({
        id: 99,
        partner_id: 42,
        order_id: 1,
        product_id: 10,
        product_name: "Serum",
        quantity: 2,
        unit_commission: 500,
        unit_discount: 0,
        amount: 1000,
        is_earned: false,
        created_at: "2026-01-01",
      });
      deliveryParcelGateway.createParcel.mockResolvedValue({
        parcelId: "parcel-uuid",
        trackingNumber: "16-ABC-ZR",
        provider: "zr",
      });
      orderRepository.update.mockResolvedValue(orderWithParcel);

      const result = await service.createOrder(payload);

      expect(orderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          product_price: 5000,
          delivery_fees: 800,
          shipping_price: 800,
        })
      );
      expect(orderItemRepository.createMany).toHaveBeenCalledWith(1, payload.items);
      expect(productRepository.getById).toHaveBeenCalledWith(10);
      expect(commissionRepository.create).toHaveBeenCalledWith({
        partner_id: 42,
        order_id: 1,
        product_id: 10,
        product_name: "Serum",
        quantity: 2,
        unit_commission: 500,
        unit_discount: 0,
        amount: 1000,
        is_earned: false,
      });
      expect(deliveryParcelGateway.createParcel).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 1,
          cityTerritoryId: "981f136a-996f-463e-a536-8e643daab193",
          districtTerritoryId: "4d3c708d-443e-430c-9e8c-00264b2e4575",
          deliveryType: "home",
          amount: 10800,
        })
      );
      expect(orderRepository.update).toHaveBeenCalledWith(1, {
        delivery_company: "zr",
        parcel_id: "parcel-uuid",
        tracking_id: "16-ABC-ZR",
      });
      expect(result.order.tracking_id).toBe("16-ABC-ZR");
      expect(result.items).toHaveLength(1);
    });

    it("rejects create without partner id", async () => {
      await expect(
        service.createOrder({
          order: {
            ...baseOrder,
            partner_id: undefined,
          } as CreateOrderInput,
        })
      ).rejects.toMatchObject({ code: "ORDER_PARTNER_REQUIRED" });
    });

    it("rejects create without delivery location", async () => {
      productRepository.getById.mockResolvedValue(product);
      commissionRepository.create.mockResolvedValue({
        id: 99,
        partner_id: 42,
        order_id: 1,
        product_id: 10,
        product_name: "Serum",
        quantity: 2,
        unit_commission: 500,
        unit_discount: 0,
        amount: 1000,
        is_earned: false,
        created_at: "2026-01-01",
      });

      await expect(
        service.createOrder({
          order: {
            ...baseOrder,
            id: undefined as unknown as number,
          } as CreateOrderInput,
          productId: 10,
        })
      ).rejects.toMatchObject({ code: "ORDER_DELIVERY_LOCATION_REQUIRED" });
    });

    it("rejects create without product id", async () => {
      await expect(
        service.createOrder({
          order: {
            ...baseOrder,
            id: undefined as unknown as number,
          } as CreateOrderInput,
          deliveryLocation,
        })
      ).rejects.toMatchObject({ code: "ORDER_PRODUCT_REQUIRED" });
    });
  });

  describe("updateOrder", () => {
    it("updates order and items", async () => {
      const updated: OrderWithItems = {
        order: { ...baseOrder, status: "delivered" },
        items: [],
      };

      orderRepository.update.mockResolvedValue(updated.order);
      orderRepository.getWithItems.mockResolvedValue(updated);
      commissionRepository.markEarnedByOrderId.mockResolvedValue(undefined);

      const result = await service.updateOrder(1, {
        order: { status: "delivered" },
      });

      expect(result.order.status).toBe("delivered");
      expect(commissionRepository.markEarnedByOrderId).toHaveBeenCalledWith(1);
    });
  });

  describe("getOrderSummary", () => {
    it("returns summary from repository", async () => {
      const summary: OrderSummary = {
        total_orders: 3,
        total_processing: 1,
        total_delivered: 2,
        total_value: 1000,
      };
      orderRepository.getSummary.mockResolvedValue(summary);

      const result = await service.getOrderSummary(42);
      expect(result).toEqual(summary);
    });
  });

  describe("deleteOrder", () => {
    it("deletes an order when status is initial", async () => {
      orderRepository.getById.mockResolvedValue({
        ...baseOrder,
        status: "initial",
      });
      orderItemRepository.deleteByOrderId.mockResolvedValue(undefined);
      orderRepository.delete.mockResolvedValue(undefined);

      await service.deleteOrder(1);

      expect(orderItemRepository.deleteByOrderId).toHaveBeenCalledWith(1);
      expect(orderRepository.delete).toHaveBeenCalledWith(1);
    });

    it("rejects delete when status is not initial", async () => {
      orderRepository.getById.mockResolvedValue(baseOrder);

      await expect(service.deleteOrder(1)).rejects.toMatchObject({
        code: "ORDER_DELETE_NOT_ALLOWED",
      });
      expect(orderRepository.delete).not.toHaveBeenCalled();
    });

    it("rejects delete when the order is missing", async () => {
      orderRepository.getById.mockResolvedValue(null);

      await expect(service.deleteOrder(1)).rejects.toMatchObject({
        code: "ORDER_NOT_FOUND",
      });
    });
  });
});
