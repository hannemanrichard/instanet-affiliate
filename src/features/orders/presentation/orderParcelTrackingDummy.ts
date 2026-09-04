import type { OrderEntity } from "../domain";

export interface ParcelTrackingEvent {
  id: string;
  status: string;
  note?: string;
  station?: string;
  deliveryMan?: string;
  createdAt: string;
  isCurrent?: boolean;
}

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const daysAgo = (days: number, hours = 0) =>
  new Date(Date.now() - (days * 24 + hours) * 60 * 60 * 1000).toISOString();

/** Dummy parcel lifecycle events — replace with ZR state-history API later. */
export const getDummyParcelTrackingEvents = (
  order: OrderEntity
): ParcelTrackingEvent[] => {
  const status = order.status?.toLowerCase() ?? "initial";
  const tracking = order.tracking_id ?? `ZR-${order.id}`;

  const created: ParcelTrackingEvent = {
    id: `${order.id}-created`,
    status: "Order created",
    note: "Affiliate order registered in the system.",
    createdAt: order.created_at ?? daysAgo(3),
  };

  const parcelCreated: ParcelTrackingEvent = {
    id: `${order.id}-parcel`,
    status: "Parcel created",
    note: `Tracking ID assigned: ${tracking}`,
    station: "Bellami Hub",
    createdAt: daysAgo(2, 18),
  };

  const validated: ParcelTrackingEvent = {
    id: `${order.id}-validated`,
    status: "Parcel validated",
    note: "Ready for pickup by delivery company.",
    station: "Algiers Sorting Center",
    createdAt: daysAgo(2, 6),
  };

  const inTransit: ParcelTrackingEvent = {
    id: `${order.id}-transit`,
    status: "In transit",
    note: "Parcel is on the way to the destination wilaya.",
    station: order.wilaya ? `${order.wilaya} Hub` : "Regional Hub",
    deliveryMan: "ZR Express",
    createdAt: daysAgo(1, 4),
  };

  const outForDelivery: ParcelTrackingEvent = {
    id: `${order.id}-out`,
    status: "Out for delivery",
    note: "Courier assigned for final delivery.",
    station: order.commune ?? order.wilaya ?? "Local agency",
    deliveryMan: "Amine B.",
    createdAt: hoursAgo(5),
    isCurrent: status === "processing",
  };

  const delivered: ParcelTrackingEvent = {
    id: `${order.id}-delivered`,
    status: "Delivered",
    note: "Parcel handed to customer successfully.",
    station: order.commune ?? order.wilaya ?? "Customer address",
    deliveryMan: "Amine B.",
    createdAt: hoursAgo(1),
    isCurrent: status === "delivered",
  };

  const cancelled: ParcelTrackingEvent = {
    id: `${order.id}-cancelled`,
    status: "Cancelled",
    note: "Delivery cancelled by partner request.",
    createdAt: hoursAgo(2),
    isCurrent: true,
  };

  const returned: ParcelTrackingEvent = {
    id: `${order.id}-returned`,
    status: "Returned to sender",
    note: "Customer refused delivery — parcel returned.",
    station: "Algiers Sorting Center",
    createdAt: hoursAgo(8),
    isCurrent: true,
  };

  switch (status) {
    case "delivered":
      return [delivered, outForDelivery, inTransit, validated, parcelCreated, created];
    case "cancelled":
      return [cancelled, validated, parcelCreated, created];
    case "returned":
      return [returned, outForDelivery, inTransit, validated, parcelCreated, created];
    case "processing":
      return [outForDelivery, inTransit, validated, parcelCreated, created];
    case "archived":
      return [delivered, outForDelivery, inTransit, validated, parcelCreated, created];
    default:
      return [parcelCreated, created];
  }
};
