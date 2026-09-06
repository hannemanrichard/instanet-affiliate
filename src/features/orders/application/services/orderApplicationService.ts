import {
  SupabaseOrderItemService,
  SupabaseOrderService,
} from "../../data";
import { SupabaseCommissionService } from "@/features/earnings/data";
import { SupabaseProductService } from "@/features/products/data";
import { DeliveryError, type DeliveryParcelGateway } from "@/features/delivery/domain";
import { zrDeliveryParcelGateway } from "@/features/delivery/data";
import { getDeliveryFeeForWilaya } from "@/shared/data/zrLocations";
import type {
  CreateOrderInput,
  CreateOrderItemInput,
  OrderEntity,
  OrderItemEntity,
  OrderSummary,
  OrderWithItems,
  UpdateOrderInput,
  UpdateOrderItemInput,
} from "../../domain";
import { canDeleteOrder, OrderError, OrderItemError } from "../../domain";
import type { OrderRepository, OrderItemRepository } from "../../domain/repositories";
import type {
  OrderFilters,
  OrderPaginationParams,
  PaginatedOrdersResult,
} from "../../domain/valueObjects";
import type { CommissionRepository } from "@/features/earnings/domain/repositories";
import type { ProductRepository } from "@/features/products/domain/repositories";

export type OrderDeliveryLocationInput = {
  /** ZR wilaya territory UUID */
  wilayaId: string;
  /** ZR commune territory UUID */
  communeId: string;
  /** ZR hub/agency UUID — required when is_stopdesk */
  agencyId?: string;
};

export interface CreateOrderPayload {
  order: CreateOrderInput;
  items?: CreateOrderItemInput[];
  auditActorId?: number;
  /** Product id used to snapshot commission at order-creation time */
  productId?: number;
  /** ZR territory ids for creating a delivery parcel */
  deliveryLocation?: OrderDeliveryLocationInput;
  /**
   * Per-unit discount the affiliate applies from their own commission.
   * Must be >= 0 and <= product.retail_commission.
   * Reduces the customer price and the affiliate's commission equally.
   */
  discount?: number;
}

export interface UpdateOrderPayload {
  order?: UpdateOrderInput;
  items?: UpdateOrderItemInput[];
  auditActorId?: number;
}

export class OrderApplicationService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly commissionRepository: CommissionRepository,
    private readonly productRepository: ProductRepository,
    private readonly deliveryParcelGateway: DeliveryParcelGateway
  ) {}

  async getOrders(filters?: OrderFilters): Promise<OrderEntity[]> {
    try {
      if (filters?.search?.trim()) {
        return await this.orderRepository.search(
          filters.search.trim(),
          filters.partnerId
        );
      }

      if (filters?.status) {
        return await this.orderRepository.getByStatus(
          filters.status,
          filters.partnerId
        );
      }

      return await this.orderRepository.getAll(filters);
    } catch {
      throw new OrderError("Failed to load orders", "ORDER_FETCH_FAILED");
    }
  }

  async getPaginatedOrders(
    filters: OrderFilters,
    pagination: OrderPaginationParams
  ): Promise<PaginatedOrdersResult> {
    try {
      return await this.orderRepository.getPaginated(filters, pagination);
    } catch (error) {
      if (error instanceof OrderError) throw error;
      throw new OrderError("Failed to load orders", "ORDER_FETCH_FAILED");
    }
  }

  async getOrderDetail(orderId: number): Promise<OrderWithItems> {
    try {
      const result = await this.orderRepository.getWithItems(orderId);
      if (!result) {
        throw new OrderError("Order not found", "ORDER_NOT_FOUND");
      }
      return result;
    } catch (error) {
      if (error instanceof OrderError) throw error;
      throw new OrderError("Failed to load order", "ORDER_FETCH_FAILED");
    }
  }

  async getOrderItems(orderId: number): Promise<OrderItemEntity[]> {
    try {
      return await this.orderItemRepository.getByOrderId(orderId);
    } catch {
      throw new OrderItemError("Failed to load order items", "ORDER_ITEM_FETCH_FAILED");
    }
  }

  async getOrderSummary(partnerId?: number): Promise<OrderSummary> {
    try {
      return await this.orderRepository.getSummary(partnerId);
    } catch {
      throw new OrderError("Failed to load order summary", "ORDER_SUMMARY_FETCH_FAILED");
    }
  }

  async createOrder(payload: CreateOrderPayload): Promise<OrderWithItems> {
    try {
      if (payload.order.partner_id == null) {
        throw new OrderError(
          "Partner id is required to create an order",
          "ORDER_PARTNER_REQUIRED"
        );
      }

      const trustedFinancials = await this.resolveTrustedFinancials(payload);

      const orderInput: CreateOrderInput = {
        ...payload.order,
        product_price: trustedFinancials.productPrice,
        delivery_fees: trustedFinancials.deliveryFees,
        status: payload.order.status ?? "initial",
        is_auto_delivered: payload.order.is_auto_delivered ?? false,
        is_exchange_required: payload.order.is_exchange_required ?? false,
        is_exchange: payload.order.is_exchange ?? false,
        has_exchange: payload.order.has_exchange ?? false,
        has_defect: payload.order.has_defect ?? false,
        return_processed: payload.order.return_processed ?? false,
        is_free_shipping: payload.order.is_free_shipping ?? true,
        agent_id: payload.order.agent_id ?? 1,
        tracker_id: payload.order.tracker_id ?? 1,
        shipping_price: trustedFinancials.deliveryFees,
        delivery_company: payload.order.delivery_company ?? "zr",
      };

      const createdOrder = await this.orderRepository.create(
        orderInput,
        payload.auditActorId
      );
      const order: OrderEntity = {
        ...createdOrder,
        product_price: trustedFinancials.productPrice,
        delivery_fees: trustedFinancials.deliveryFees,
        shipping_price: trustedFinancials.deliveryFees,
      };

      let items: OrderItemEntity[] = [];
      if (payload.items?.length) {
        items = await this.orderItemRepository.createMany(
          order.id,
          payload.items,
          payload.auditActorId
        );
      }

      await this.createCommissionSnapshot(
        order,
        payload.productId,
        payload.discount,
        payload.auditActorId
      );

      const updatedOrder = await this.createDeliveryParcel(
        order,
        payload.deliveryLocation,
        payload.auditActorId
      );

      return { order: updatedOrder, items };
    } catch (error) {
      if (error instanceof OrderError) throw error;
      if (error instanceof DeliveryError) {
        throw new OrderError(error.message, error.code);
      }
      throw new OrderError("Failed to create order", "ORDER_CREATE_FAILED");
    }
  }

  private async resolveTrustedFinancials(
    payload: CreateOrderPayload
  ): Promise<{ productPrice: number; deliveryFees: number }> {
    if (!payload.productId) {
      throw new OrderError(
        "Product id is required to create an order",
        "ORDER_PRODUCT_REQUIRED"
      );
    }

    const product = await this.productRepository.getById(payload.productId);
    if (!product) {
      throw new OrderError("Product not found", "ORDER_PRODUCT_NOT_FOUND");
    }

    if (!payload.deliveryLocation?.wilayaId) {
      throw new OrderError(
        "Delivery location (wilaya) is required",
        "ORDER_DELIVERY_LOCATION_REQUIRED"
      );
    }

    const deliveryFees = getDeliveryFeeForWilaya(
      payload.deliveryLocation.wilayaId,
      payload.order.is_stopdesk ?? false
    );

    if (deliveryFees == null) {
      throw new OrderError(
        "Delivery fee could not be resolved for the selected wilaya",
        "ORDER_DELIVERY_FEE_NOT_FOUND"
      );
    }

    return {
      productPrice: product.retail_price ?? 0,
      deliveryFees,
    };
  }

  async updateOrder(orderId: number, payload: UpdateOrderPayload): Promise<OrderWithItems> {
    try {
      if (payload.order) {
        await this.orderRepository.update(orderId, payload.order, payload.auditActorId);
        await this.syncCommissionEarnedIfDelivered(
          orderId,
          payload.order.status,
          payload.auditActorId
        );
      }

      if (payload.items) {
        await this.orderItemRepository.updateMany(
          orderId,
          payload.items,
          payload.auditActorId
        );
      }

      const updated = await this.orderRepository.getWithItems(orderId);
      if (!updated) {
        throw new OrderError("Order not found after update", "ORDER_NOT_FOUND");
      }

      return updated;
    } catch (error) {
      if (error instanceof OrderError) throw error;
      throw new OrderError("Failed to update order", "ORDER_UPDATE_FAILED");
    }
  }

  async updateOrderStatus(
    orderId: number,
    status: string,
    changedBy?: number
  ): Promise<OrderEntity> {
    try {
      const order = await this.orderRepository.update(
        orderId,
        { status },
        changedBy
      );
      await this.syncCommissionEarnedIfDelivered(orderId, status, changedBy);
      return order;
    } catch {
      throw new OrderError("Failed to update order status", "ORDER_STATUS_UPDATE_FAILED");
    }
  }

  async replaceOrderItems(
    orderId: number,
    items: UpdateOrderItemInput[],
    changedBy?: number
  ): Promise<OrderItemEntity[]> {
    try {
      return await this.orderItemRepository.updateMany(orderId, items, changedBy);
    } catch {
      throw new OrderItemError(
        "Failed to update order items",
        "ORDER_ITEM_UPDATE_FAILED"
      );
    }
  }

  async deleteOrder(orderId: number, changedBy?: number): Promise<void> {
    try {
      const existing = await this.orderRepository.getById(orderId);
      if (!existing) {
        throw new OrderError("Order not found", "ORDER_NOT_FOUND");
      }
      if (!canDeleteOrder(existing.status)) {
        throw new OrderError(
          "Only orders with initial status can be deleted",
          "ORDER_DELETE_NOT_ALLOWED"
        );
      }

      await this.orderItemRepository.deleteByOrderId(orderId, changedBy);
      await this.orderRepository.delete(orderId, changedBy);
    } catch (error) {
      if (error instanceof OrderError) throw error;
      throw new OrderError("Failed to delete order", "ORDER_DELETE_FAILED");
    }
  }

  /**
   * Locks the product commission rate at order-creation time.
   * Delivery (COD) can take days; product rates may change meanwhile.
   *
   * When a discount is applied the affiliate sacrifices part of their
   * commission so the customer pays less:
   *   effective commission = retail_commission − discount
   *   effective product_price = retail_price − discount
   */
  private async createCommissionSnapshot(
    order: OrderEntity,
    productId?: number,
    discount?: number,
    changedBy?: number
  ): Promise<void> {
    if (order.partner_id == null) return;

    let unitCommission = 0;
    let resolvedProductId = productId;
    let productName = order.product;

    if (productId) {
      const product = await this.productRepository.getById(productId);
      if (product) {
        unitCommission = product.retail_commission ?? 0;
        productName = product.name;
        resolvedProductId = product.id;
      }
    }

    const safeDiscount =
      discount != null && Number.isFinite(discount) && discount > 0
        ? Math.min(discount, unitCommission)
        : 0;

    const quantity = order.product_qty || 1;
    const amount = (unitCommission - safeDiscount) * quantity;

    // Reduce the customer-facing price stored on the order
    if (safeDiscount > 0) {
      const currentPrice = order.product_price ?? 0;
      await this.orderRepository.update(
        order.id,
        {
          product_price: currentPrice - safeDiscount,
        },
        changedBy
      );
    }

    await this.commissionRepository.create(
      {
        partner_id: order.partner_id,
        order_id: order.id,
        product_id: resolvedProductId,
        product_name: productName,
        quantity,
        unit_commission: unitCommission,
        unit_discount: safeDiscount,
        amount,
        is_earned: false,
      },
      changedBy
    );
  }

  /**
   * Creates a ZR Express parcel and persists tracking/parcel ids on the order.
   * @see https://docs.zrexpress.app/reference/createparcelendpoint
   */
  private async createDeliveryParcel(
    order: OrderEntity,
    location?: OrderDeliveryLocationInput,
    changedBy?: number
  ): Promise<OrderEntity> {
    if (!location?.wilayaId || !location?.communeId) {
      throw new OrderError(
        "Delivery location (wilaya and commune) is required",
        "ORDER_DELIVERY_LOCATION_REQUIRED"
      );
    }

    const customerName = [order.first_name, order.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (!customerName || customerName.length < 2) {
      throw new OrderError(
        "Customer name is required for delivery",
        "ORDER_CUSTOMER_NAME_REQUIRED"
      );
    }

    if (!order.phone?.trim()) {
      throw new OrderError(
        "Customer phone is required for delivery",
        "ORDER_PHONE_REQUIRED"
      );
    }

    const productName = order.product?.trim() || "Order";
    const quantity = order.product_qty || 1;
    const unitPrice = order.product_price ?? 0;
    const productTotal = unitPrice * quantity;
    const deliveryFees = order.delivery_fees ?? 0;
    const amount = productTotal + deliveryFees;

    const descriptionParts = [
      productName,
      order.product_color,
      order.product_size,
    ].filter(Boolean);

    const parcel = await this.deliveryParcelGateway.createParcel({
      orderId: order.id,
      customerName,
      phone: order.phone,
      phone2: order.phone2,
      address: order.address,
      cityTerritoryId: location.wilayaId,
      districtTerritoryId: location.communeId,
      hubId: order.is_stopdesk ? location.agencyId : undefined,
      deliveryType: order.is_stopdesk ? "pickup-point" : "home",
      products: [
        {
          name: productName,
          unitPrice,
          quantity,
        },
      ],
      amount,
      description: descriptionParts.join(" · "),
    });

    return this.orderRepository.update(
      order.id,
      {
        delivery_company: "zr",
        parcel_id: parcel.parcelId,
        tracking_id: parcel.trackingNumber,
      },
      changedBy
    );
  }

  /**
   * App-side sync (DB trigger also handles Bellami status updates on shared DB).
   */
  private async syncCommissionEarnedIfDelivered(
    orderId: number,
    status?: string,
    changedBy?: number
  ): Promise<void> {
    if ((status ?? "").toLowerCase() !== "delivered") return;
    await this.commissionRepository.markEarnedByOrderId(orderId, changedBy);
  }
}

const orderService = new SupabaseOrderService();
const orderItemService = new SupabaseOrderItemService();
const commissionService = new SupabaseCommissionService();
const productService = new SupabaseProductService();

export const orderApplicationService = new OrderApplicationService(
  orderService,
  orderItemService,
  commissionService,
  productService,
  zrDeliveryParcelGateway
);
