"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AppIcon } from "@/shared/components/layout/AppIcon";
import { uiIcons } from "@/shared/components/layout/navIcons";
import { cn } from "@/shared/utils/utils";
import type { OrderEntity } from "../domain";
import { OrderTrackingDialog } from "./OrderTrackingDialog";
import {
  formatDcRecentStatusLabel,
  formatOrderStatusLabel,
  getOrderStatusIcon,
  getOrderStatusStyle,
  orderStatusBadgeClassName,
} from "./orderTableUtils";

type OrderStatusBadgeProps = {
  order: OrderEntity;
  disabled?: boolean;
};

const statusBadgeInteractiveClassName = [
  orderStatusBadgeClassName,
  "h-8 max-w-[16.5rem] gap-2 pe-2.5 ps-2",
  "transition-[background-color,border-color,box-shadow] duration-150",
  "hover:shadow-sm",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  "disabled:pointer-events-none disabled:opacity-50",
].join(" ");

type OrderStatusPillProps = {
  order: OrderEntity;
};

/** Read-only combined status icon + DC recent status badge. */
export const OrderStatusPill = ({ order }: OrderStatusPillProps) => {
  const status = order.status ?? "initial";
  const style = getOrderStatusStyle(status);
  const icon = uiIcons[getOrderStatusIcon(status)];
  const dcLabel = formatDcRecentStatusLabel(order.dc_recent_status);
  const label = dcLabel || formatOrderStatusLabel(status);

  return (
    <span
      className={cn(
        orderStatusBadgeClassName,
        "h-8 max-w-full gap-2 pe-2.5 ps-2",
        style.badge
      )}
      title={label}
    >
        <AppIcon icon={icon} size={14} strokeWidth={0} />
      <span className="min-w-0 truncate">{label}</span>
    </span>
  );
};

export const OrderStatusBadge = ({
  order,
  disabled = false,
}: OrderStatusBadgeProps) => {
  const t = useTranslations("affiliateDashboard.orders");
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const status = order.status ?? "initial";
  const statusLabel = formatOrderStatusLabel(status);
  const style = getOrderStatusStyle(status);
  const icon = uiIcons[getOrderStatusIcon(status)];
  const dcLabel = formatDcRecentStatusLabel(order.dc_recent_status);
  const label = dcLabel || statusLabel;

  const handleOpenTracking = () => {
    setIsTrackingOpen(true);
  };

  return (
    <>
      <button
        type="button"
        className={cn(statusBadgeInteractiveClassName, style.badge)}
        onClick={handleOpenTracking}
        disabled={disabled}
        aria-label={t("viewTrackingAria")}
        title={label}
      >
        <AppIcon icon={icon} size={14} strokeWidth={0} />
        <span className="min-w-0 truncate">{label}</span>
      </button>

      <OrderTrackingDialog
        order={order}
        open={isTrackingOpen}
        onOpenChange={setIsTrackingOpen}
      />
    </>
  );
};
