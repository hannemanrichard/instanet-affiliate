import {
  useStandardMutation,
  useStandardQuery,
} from "@/shared/hooks/useReactQuery";
import { apiFetch } from "@/shared/utils/apiFetch";
import type {
  CreateOrderItemInput,
  CreateOrderInput,
  OrderFilters,
  OrderItemEntity,
  OrderSummary,
  OrderWithItems,
  PaginatedOrdersResult,
  UpdateOrderInput,
  UpdateOrderItemInput,
} from "../domain";

const ordersKey = ["orders"];
const orderDetailKey = (orderId: number) => [...ordersKey, orderId.toString()];
const orderItemsKey = (orderId: number) => [
  ...ordersKey,
  orderId.toString(),
  "items",
];
const orderSummaryKey = [...ordersKey, "summary"];

/** Client payload — partner_id / status / delivery statuses are set on the server */
export type ClientCreateOrderPayload = {
  order: Omit<
    CreateOrderInput,
    | "partner_id"
    | "status"
    | "dc_recent_status"
    | "yalidine_status"
    | "tracking_id"
    | "parcel_id"
    | "tracker_id"
    | "agent_id"
    | "delivery_company"
    | "is_auto_delivered"
    | "return_processed"
    | "product_price"
    | "delivery_fees"
    | "shipping_price"
  >;
  items?: CreateOrderItemInput[];
  productId?: number;
  deliveryLocation?: {
    wilayaId: string;
    communeId: string;
    agencyId?: string;
  };
  /** Per-unit discount the affiliate applies from their own commission */
  discount?: number;
};

export type UpdateOrderPayload = {
  order?: UpdateOrderInput;
  items?: UpdateOrderItemInput[];
};

export const usePaginatedOrders = (
  filters: Omit<OrderFilters, "partnerId">,
  page = 1,
  limit = 10,
  enabled = true
) => {
  const trimmedSearch = filters.search?.trim() ?? "";

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (filters.status) params.set("status", String(filters.status));
  if (trimmedSearch) params.set("search", trimmedSearch);

  return useStandardQuery(
    [
      ...ordersKey,
      "paginated",
      filters.status ?? "all",
      trimmedSearch || "nosearch",
      `page:${page}`,
      `limit:${limit}`,
    ],
    () =>
      apiFetch<PaginatedOrdersResult>(`/api/orders?${params.toString()}`),
    {
      enabled,
      staleTime: 60 * 1000,
    }
  );
};

export const useOrder = (orderId: number, enabled = true) => {
  return useStandardQuery(
    orderDetailKey(orderId),
    () => apiFetch<OrderWithItems>(`/api/orders/${orderId}`),
    {
      enabled: enabled && orderId > 0,
      staleTime: 60 * 1000,
    }
  );
};

export const useOrderItems = (orderId: number) => {
  return useStandardQuery(
    orderItemsKey(orderId),
    () =>
      apiFetch<{ items: OrderItemEntity[] }>(
        `/api/orders/${orderId}/items`
      ).then((data) => data.items),
    {
      enabled: orderId > 0,
      staleTime: 60 * 1000,
    }
  );
};

export const useOrderSummary = (enabled = true) => {
  return useStandardQuery(
    orderSummaryKey,
    () => apiFetch<OrderSummary>("/api/orders/summary"),
    {
      enabled,
      staleTime: 5 * 60 * 1000,
    }
  );
};

export const useCreateOrder = () => {
  return useStandardMutation(
    (payload: ClientCreateOrderPayload) =>
      apiFetch<OrderWithItems>("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    {
      invalidateQueries: [ordersKey, orderSummaryKey, ["earnings"]],
      successMessage: "Order created successfully",
      errorMessage: "Failed to create order",
    }
  );
};

export const useUpdateOrder = () => {
  return useStandardMutation(
    ({
      orderId,
      payload,
    }: {
      orderId: number;
      payload: UpdateOrderPayload;
    }) =>
      apiFetch<OrderWithItems>(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    {
      invalidateQueries: [ordersKey, orderSummaryKey, ["earnings"]],
      successMessage: "Order updated successfully",
      errorMessage: "Failed to update order",
    }
  );
};

export const useReplaceOrderItems = () => {
  return useStandardMutation(
    ({
      orderId,
      items,
    }: {
      orderId: number;
      items: UpdateOrderItemInput[];
    }) =>
      apiFetch<{ items: OrderItemEntity[] }>(`/api/orders/${orderId}/items`, {
        method: "PUT",
        body: JSON.stringify({ items }),
      }).then((data) => data.items),
    {
      invalidateQueries: [ordersKey],
      successMessage: "Order items updated",
      errorMessage: "Failed to update order items",
    }
  );
};

export const useDeleteOrder = () => {
  return useStandardMutation(
    (orderId: number) =>
      apiFetch<{ success: boolean }>(`/api/orders/${orderId}`, {
        method: "DELETE",
      }),
    {
      invalidateQueries: [ordersKey, orderSummaryKey, ["earnings"]],
      successMessage: "Order deleted",
      errorMessage: "Failed to delete order",
    }
  );
};
