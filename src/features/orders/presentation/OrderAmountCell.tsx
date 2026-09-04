"use client";

import { useTranslations } from "next-intl";
import { AppIcon } from "@/shared/components/layout/AppIcon";
import { uiIcons } from "@/shared/components/layout/navIcons";
import { cn } from "@/shared/utils/utils";
import type { OrderEntity } from "../domain";
import { getOrderAmount } from "./orderTableUtils";

type OrderAmountCellProps = {
  order: OrderEntity;
  currency: string;
};

const formatAmount = (amount?: number | null) => {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(amount);
};

export const OrderAmountCell = ({ order, currency }: OrderAmountCellProps) => {
  const t = useTranslations("affiliateDashboard.orders");
  const commission = order.commission_amount;
  const amount = getOrderAmount(order);

  return (
    <div className="flex min-w-0 flex-col items-start gap-1.5">
      <span
        className={cn(
          "inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border px-2.5",
          "border-emerald-200/80 bg-[#EEFBF4] text-emerald-800",
          "text-[11px] font-semibold leading-none tracking-wide tabular-nums",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)]"
        )}
        title={t("commissionLabel")}
      >
        <span
          className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700"
          aria-hidden
        >
          <AppIcon icon={uiIcons.wallet} size={11} />
        </span>
        <span className="sr-only">{t("commissionLabel")}</span>
        <span>{formatAmount(commission)}</span>
        <span className="text-[10px] font-medium text-emerald-700/70">
          {currency}
        </span>
      </span>

      <span
        className="inline-flex items-center gap-1 ps-0.5 text-xs leading-none tabular-nums text-muted-foreground"
        title={t("columns.amount")}
      >
        <AppIcon
          icon={uiIcons.invoice}
          size={11}
          className="text-muted-foreground/80"
        />
        <span className="sr-only">{t("columns.amount")}</span>
        <span>{formatAmount(amount)}</span>
        <span className="text-[10px] font-medium text-muted-foreground/70">
          {currency}
        </span>
      </span>
    </div>
  );
};
