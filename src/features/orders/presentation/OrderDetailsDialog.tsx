"use client";

import type { ReactNode } from "react";
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
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils/utils";
import { formatRelativeDate } from "@/shared/utils/formatRelativeDate";
import { useOrder } from "../application";
import type { OrderEntity } from "../domain";
import { OrderAmountCell } from "./OrderAmountCell";
import { OrderProductCell } from "./OrderProductCell";
import { OrderStatusPill } from "./OrderStatusBadge";
import {
  getOrderCustomerName,
  getOrderLocationLabel,
} from "./orderTableUtils";

type OrderDetailsDialogProps = {
  orderId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const sectionCardClassName =
  "space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3.5";

const sectionTitleClassName =
  "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";

const DetailRow = ({
  label,
  children,
  value,
}: {
  label: string;
  children?: ReactNode;
  value?: string;
}) => {
  const content = children ?? value;
  if (content == null) return null;
  if (typeof content === "string" && (!content.trim() || content === "—")) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="break-words text-sm leading-snug text-foreground">
        {content}
      </div>
    </div>
  );
};

const TrackingBadge = ({
  trackingId,
  emptyLabel,
  copyAria,
}: {
  trackingId?: string;
  emptyLabel: string;
  copyAria: string;
}) => {
  const value = trackingId?.trim() ?? "";

  if (!value) {
    return (
      <span className="inline-flex h-8 items-center rounded-full border border-dashed border-border bg-muted/40 px-2.5 text-[11px] font-medium text-muted-foreground">
        {emptyLabel}
      </span>
    );
  }

  const handleCopyTracking = () => {
    void navigator.clipboard.writeText(value);
  };

  return (
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
      aria-label={copyAria}
    >
      <AppIcon icon={uiIcons.copy} size={12} className="opacity-70" />
      <span className="truncate">{value}</span>
    </button>
  );
};

export const OrderDetailsDialog = ({
  orderId,
  open,
  onOpenChange,
}: OrderDetailsDialogProps) => {
  const t = useTranslations("affiliateDashboard.orders");
  const tDash = useTranslations("affiliateDashboard");
  const locale = useLocale();
  const orderQuery = useOrder(orderId, open);
  const order: OrderEntity | undefined = orderQuery.data?.order;
  const phone = order?.phone?.trim() ?? "";
  const phone2 = order?.phone2?.trim() ?? "";
  const customerName = order ? getOrderCustomerName(order) : "";
  const location = order ? getOrderLocationLabel(order) : "";

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex h-[min(90dvh,42rem)] w-[calc(100%-1.25rem)] max-w-lg flex-col gap-0 overflow-hidden p-0",
          "sm:rounded-xl"
        )}
      >
        <DialogHeader className="shrink-0 gap-0 space-y-0 border-b bg-background px-5 py-4 pe-12 sm:px-6">
          <div className="min-w-0 space-y-1">
            <DialogTitle className="text-base font-semibold tracking-tight">
              {t("details.title")}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              {t("details.description")}
            </DialogDescription>
          </div>
          <div className="mt-3">
            <TrackingBadge
              trackingId={order?.tracking_id}
              emptyLabel={t("details.noTracking")}
              copyAria={t("copyTrackingAria")}
            />
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain touch-pan-y [scrollbar-gutter:stable]">
          <div className="space-y-3 px-5 py-4 sm:px-6 sm:py-5">
            {orderQuery.isLoading ? (
              <div className="space-y-3" aria-busy="true">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
              </div>
            ) : null}

            {orderQuery.isError ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm text-destructive">
                {t("details.loadError")}
              </p>
            ) : null}

            {order ? (
              <>
                <section className={sectionCardClassName}>
                  <h3 className={sectionTitleClassName}>
                    {t("details.customer")}
                  </h3>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium leading-tight">
                      {customerName}
                    </p>
                    {location !== "—" ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {location}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid gap-3 border-t border-border/60 pt-3 sm:grid-cols-2">
                    <DetailRow label={t("print.phone")}>
                      {phone ? (
                        <a
                          href={`tel:${phone}`}
                          className="inline-flex min-w-0 items-center gap-1.5 text-foreground underline-offset-2 hover:underline"
                          aria-label={t("callPhoneAria", { phone })}
                        >
                          <AppIcon
                            icon={uiIcons.phone}
                            size={14}
                            className="text-muted-foreground"
                          />
                          <span className="truncate tabular-nums">{phone}</span>
                        </a>
                      ) : null}
                    </DetailRow>
                    <DetailRow label={t("print.phone2")}>
                      {phone2 ? (
                        <a
                          href={`tel:${phone2}`}
                          className="inline-flex min-w-0 items-center gap-1.5 text-foreground underline-offset-2 hover:underline"
                          aria-label={t("callPhoneAria", { phone: phone2 })}
                        >
                          <AppIcon
                            icon={uiIcons.phone}
                            size={14}
                            className="text-muted-foreground"
                          />
                          <span className="truncate tabular-nums">{phone2}</span>
                        </a>
                      ) : null}
                    </DetailRow>
                    <DetailRow
                      label={t("print.address")}
                      value={order.address ?? ""}
                    />
                    <DetailRow
                      label={t("details.location")}
                      value={location}
                    />
                    {order.is_stopdesk ? (
                      <DetailRow
                        label={t("print.stopdesk")}
                        value={order.stopdesk?.trim() || t("print.yes")}
                      />
                    ) : null}
                  </div>
                </section>

                <section className={sectionCardClassName}>
                  <h3 className={sectionTitleClassName}>
                    {t("columns.status")}
                  </h3>
                  <OrderStatusPill order={order} />
                </section>

                <section className={sectionCardClassName}>
                  <h3 className={sectionTitleClassName}>{t("details.items")}</h3>
                  <div className="flex min-w-0 items-center gap-3">
                    <OrderProductCell order={order} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {order.product?.trim() || t("columns.product")}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[order.product_color, order.product_size]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                  </div>
                </section>

                <section className={sectionCardClassName}>
                  <h3 className={sectionTitleClassName}>
                    {t("commissionLabel")}
                  </h3>
                  <OrderAmountCell
                    order={order}
                    currency={tDash("currencySymbol")}
                  />
                </section>

                {order.comment?.trim() ? (
                  <section className={sectionCardClassName}>
                    <h3 className={sectionTitleClassName}>
                      {t("print.notes")}
                    </h3>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                      {order.comment}
                    </p>
                  </section>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        {order ? (
          <p className="shrink-0 border-t bg-muted/30 px-5 py-3 text-xs text-muted-foreground sm:px-6">
            {t("columns.created")}: {formatRelativeDate(order.created_at, locale)}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
