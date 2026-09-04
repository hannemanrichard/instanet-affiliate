import type { OrderStatus } from "../domain";

export const getOrderCustomerName = (order: {
  first_name?: string;
  last_name?: string;
}): string =>
  [order.first_name, order.last_name].filter(Boolean).join(" ") || "—";

export const getOrderLocationLabel = (order: {
  wilaya?: string;
  commune?: string;
}): string => {
  const parts = [order.wilaya, order.commune].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
};

export type OrderStatusTone = "info" | "success" | "error" | "neutral";

export type OrderStatusStyle = {
  badge: string;
  /** Dot + soft halo (badge trigger) */
  dot: string;
  /** Solid dot only (menus / filters) */
  dotCore: string;
};

export const getOrderStatusTone = (status?: string): OrderStatusTone => {
  const normalized = (status ?? "").toLowerCase();

  if (normalized === "processing") return "info";
  if (normalized === "delivered") return "success";
  if (normalized === "returned") return "error";
  return "neutral";
};

const orderStatusStyles: Record<OrderStatusTone, OrderStatusStyle> = {
  info: {
    badge:
      "border-sky-200/80 bg-[#F0F9FF] text-sky-800 hover:bg-[#E0F2FE] focus-visible:ring-sky-200/80 data-[state=open]:border-sky-300 data-[state=open]:ring-sky-200/70",
    dot: "bg-sky-500 ring-sky-200/90",
    dotCore: "bg-sky-500",
  },
  success: {
    badge:
      "border-emerald-200/80 bg-[#EEFBF4] text-emerald-800 hover:bg-[#E0F7EB] focus-visible:ring-emerald-200/80 data-[state=open]:border-emerald-300 data-[state=open]:ring-emerald-200/70",
    dot: "bg-emerald-500 ring-emerald-200/90",
    dotCore: "bg-emerald-500",
  },
  error: {
    badge:
      "border-rose-200/80 bg-[#FFF1F2] text-rose-800 hover:bg-[#FFE4E6] focus-visible:ring-rose-200/80 data-[state=open]:border-rose-300 data-[state=open]:ring-rose-200/70",
    dot: "bg-rose-500 ring-rose-200/90",
    dotCore: "bg-rose-500",
  },
  neutral: {
    badge:
      "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 focus-visible:ring-neutral-200/80 data-[state=open]:border-neutral-300 data-[state=open]:ring-neutral-200/70",
    dot: "bg-neutral-400 ring-neutral-200/90",
    dotCore: "bg-neutral-400",
  },
};

export const getOrderStatusStyle = (status?: string): OrderStatusStyle =>
  orderStatusStyles[getOrderStatusTone(status)];

export const formatOrderStatusLabel = (status: OrderStatus | string): string => {
  if (!status) return "—";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const getOrderAmount = (order: {
  product_price?: number;
  product_qty?: number;
  shipping_price?: number;
  delivery_fees?: number;
}): number => {
  const productTotal = (order.product_price ?? 0) * (order.product_qty ?? 0);
  const shipping = order.shipping_price ?? order.delivery_fees ?? 0;
  return productTotal + shipping;
};

export { canDeleteOrder } from "../domain";

export const getOrderStatusIcon = (status?: string) => {
  const normalized = (status ?? "").toLowerCase();

  if (normalized === "processing") return "packageProcess" as const;
  if (normalized === "delivered") return "packageDelivered" as const;
  if (normalized === "returned") return "packageRemove" as const;
  return "packageOpen" as const;
};

export const formatDcRecentStatusLabel = (status?: string): string => {
  const normalized = status?.trim().replace(/_/g, " ").replace(/\s+/g, " ");
  if (!normalized) return "";

  return normalized
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

export const orderStatusBadgeClassName = [
  "inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border px-3",
  "text-[11px] font-semibold leading-none tracking-wide",
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)]",
].join(" ");
