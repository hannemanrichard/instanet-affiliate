import type {
  CreateOrderItemInput,
  OrderEntity,
  OrderItemEntity,
  OrderSummary,
  OrderWithItems,
  UpdateOrderItemInput,
} from "./entities";
import type {
  OrderFilters,
  OrderPaginationParams,
  OrderStatus,
  PaginatedOrdersResult,
} from "./valueObjects";

export type CreateOrderInput = Omit<OrderEntity, "id" | "created_at" | "modified_at">;
export type UpdateOrderInput = Partial<Omit<OrderEntity, "id">>;

export interface OrderRepository {
  getAll(filters?: OrderFilters): Promise<OrderEntity[]>;
  getById(id: number): Promise<OrderEntity | null>;
  getByStatus(status: OrderStatus, partnerId?: number): Promise<OrderEntity[]>;
  search(term: string, partnerId?: number): Promise<OrderEntity[]>;
  getPaginated(
    filters: OrderFilters,
    pagination: OrderPaginationParams
  ): Promise<PaginatedOrdersResult>;
  create(data: CreateOrderInput, changedBy?: number): Promise<OrderEntity>;
  update(id: number, data: UpdateOrderInput, changedBy?: number): Promise<OrderEntity>;
  delete(id: number, changedBy?: number): Promise<void>;
  getWithItems(id: number): Promise<OrderWithItems | null>;
  getSummary(partnerId?: number): Promise<OrderSummary>;
}

export interface OrderItemRepository {
  getByOrderId(orderId: number): Promise<OrderItemEntity[]>;
  createMany(
    orderId: number,
    items: CreateOrderItemInput[],
    changedBy?: number
  ): Promise<OrderItemEntity[]>;
  updateMany(
    orderId: number,
    items: UpdateOrderItemInput[],
    changedBy?: number
  ): Promise<OrderItemEntity[]>;
  deleteByOrderId(orderId: number, changedBy?: number): Promise<void>;
}
