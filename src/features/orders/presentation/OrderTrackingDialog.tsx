"use client";

import { useLocale, useTranslations } from "next-intl";
import { AppIcon } from "@/shared/components/layout/AppIcon";
import { uiIcons } from "@/shared/components/layout/navIcons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/utils/utils";
import type { OrderEntity } from "../domain";
import { OrderParcelTimeline } from "./OrderParcelTimeline";
import { getDummyParcelTrackingEvents } from "./orderParcelTrackingDummy";
import {
  formatDcRecentStatusLabel,
  formatOrderStatusLabel,
  getOrderStatusIcon,
  getOrderStatusStyle,
  orderStatusBadgeClassName,
} from "./orderTableUtils";

type OrderTrackingDialogProps = {
  order: OrderEntity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const OrderTrackingDialog = ({
  order,
  open,
  onOpenChange,
}: OrderTrackingDialogProps) => {
  const t = useTranslations("affiliateDashboard.orders");
  const locale = useLocale();
  const status = order.status ?? "initial";
  const style = getOrderStatusStyle(status);
  const icon = uiIcons[getOrderStatusIcon(status)];
  const dcLabel = formatDcRecentStatusLabel(order.dc_recent_status);
  const statusLabel = dcLabel || formatOrderStatusLabel(status);
  const trackingId = order.tracking_id?.trim() ?? "";
  const events = getDummyParcelTrackingEvents(order);

  const handleCopyTracking = () => {
    if (!trackingId) return;
    void navigator.clipboard.writeText(trackingId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(90dvh,36rem)] w-[calc(100%-1.25rem)] max-w-md flex-col gap-0 overflow-hidden p-0",
          "sm:rounded-xl"
        )}
      >
        <DialogHeader className="shrink-0 gap-0 space-y-0 border-b bg-background px-5 py-4 pe-12 sm:px-6">
          <div className="min-w-0 space-y-1">
            <DialogTitle className="text-base font-semibold tracking-tight">
              {t("trackingTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              {t("trackingDescription")}
            </DialogDescription>
          </div>

          <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
            <span
              className={cn(
                orderStatusBadgeClassName,
                "h-8 max-w-full gap-2 pe-2.5 ps-2",
                style.badge
              )}
              title={statusLabel}
            >
              <AppIcon icon={icon} size={14} strokeWidth={0} />
              <span className="min-w-0 truncate">{statusLabel}</span>
            </span>

            {trackingId ? (
              <button
                type="button"
                onClick={handleCopyTracking}
                className={cn(
                  "inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border px-2.5",
                  "border-sky-200/80 bg-[#F0F9FF] text-sky-800",
                  "text-[11px] font-semibold leading-none tracking-wide tabular-nums",
                  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)]",
                  "transition-colors hover:bg-[#E0F2FE]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/80 focus-visible:ring-offset-2"
                )}
                aria-label={t("copyTrackingAria")}
              >
                <AppIcon icon={uiIcons.copy} size={12} className="opacity-70" />
                <span className="truncate">{trackingId}</span>
              </button>
            ) : (
              <span className="inline-flex h-8 items-center rounded-full border border-dashed border-border bg-muted/40 px-2.5 text-[11px] font-medium text-muted-foreground">
                {t("details.noTracking")}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
          <OrderParcelTimeline
            events={events}
            locale={locale}
            emptyLabel={t("trackingEmpty")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
