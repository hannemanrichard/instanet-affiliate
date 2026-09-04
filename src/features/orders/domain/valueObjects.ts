export type OrderStatus =
  | "initial"
  | "processing"
  | "delivered"
  | "cancelled"
  | "returned"
  | "archived"
  | string;

export interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  agentId?: number;
  partnerId?: number;
}

export interface OrderPaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedOrdersResult {
  data: import("./entities").OrderEntity[];
  total: number;
  page: number;
  limit: number;
}

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "initial",
  "processing",
  "delivered",
  "returned",
];

export const canDeleteOrder = (status?: string): boolean =>
  (status ?? "").toLowerCase() === "initial";
