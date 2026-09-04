"use client";

import { useTranslations } from "next-intl";
import { Percent, Wallet } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  controlClass,
  fieldLabelClass,
  sectionClass,
  sectionTitleClass,
} from "./createOrderFormStyles";

interface OrderAmountBreakdownProps {
  subtotal: number;
  totalQty: number;
  /** null when the wilaya (hence the fee) is not selected yet */
  deliveryFee: number | null;
  /** Base commission (before discount) */
  baseCommission: number;
  /** Effective commission after discount */
  commission: number;
  /** Total discount across all items */
  totalDiscount: number;
  /** Customer-facing subtotal after discount */
  discountedSubtotal: number;
  /** Max per-unit discount the affiliate can apply */
  maxDiscount: number;
  /** Current per-unit discount input value */
  discount: number;
  /** Callback when the affiliate changes the discount */
  onDiscountChange: (value: number) => void;
  currency: string;
}

const formatAmountValue = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(amount);

export const OrderAmountBreakdown = ({
  subtotal,
  totalQty,
  deliveryFee,
  baseCommission,
  commission,
  totalDiscount,
  discountedSubtotal,
  maxDiscount,
  discount,
  onDiscountChange,
  currency,
}: OrderAmountBreakdownProps) => {
  const t = useTranslations("affiliateDashboard.orders.create");
  const formatAmount = (amount: number) =>
    `${formatAmountValue(amount)} ${currency}`;

  const total = discountedSubtotal + (deliveryFee ?? 0);

  const handleDiscountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (raw === "") {
      onDiscountChange(0);
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    onDiscountChange(Math.min(parsed, maxDiscount));
  };

  return (
    <section
      className={sectionClass}
      aria-labelledby="order-summary-heading"
      role="status"
      aria-live="polite"
    >
      <h3 id="order-summary-heading" className={sectionTitleClass}>
        {t("sectionSummary")}
      </h3>

      <div className="space-y-3 rounded-xl border border-[#e2e2e2] bg-[#fafafa] p-4">
        {/* Discount input */}
        {maxDiscount > 0 ? (
          <div className="space-y-1.5">
            <Label htmlFor="order-discount" className={fieldLabelClass}>
              <span className="flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                {t("discountLabel")}
              </span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="order-discount"
                type="number"
                min={0}
                max={maxDiscount}
                step={1}
                value={discount || ""}
                onChange={handleDiscountChange}
                placeholder="0"
                aria-label={t("discountAria")}
                className={cn(controlClass, "max-w-32 tabular-nums")}
              />
              <span className="text-xs text-muted-foreground">
                {t("discountMax", { max: formatAmountValue(maxDiscount), currency })}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("discountHint")}
            </p>
          </div>
        ) : null}

        {/* Breakdown */}
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">
              {t("subtotal")}{" "}
              <span className="text-xs">
                · {t("subtotalItems", { count: totalQty })}
              </span>
            </dt>
            <dd className="font-semibold tabular-nums text-[#222]">
              {formatAmount(subtotal)}
            </dd>
          </div>

          {totalDiscount > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-emerald-600">
                <Percent className="h-3.5 w-3.5" aria-hidden />
                {t("discountRow")}
              </dt>
              <dd className="font-semibold tabular-nums text-emerald-600">
                −{formatAmount(totalDiscount)}
              </dd>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">{t("deliveryFee")}</dt>
            <dd
              className={cn(
                "font-semibold tabular-nums",
                deliveryFee == null
                  ? "text-xs font-medium text-muted-foreground"
                  : "text-[#222]"
              )}
            >
              {deliveryFee == null
                ? t("deliveryFeePending")
                : formatAmount(deliveryFee)}
            </dd>
          </div>

          <div
            className="flex items-center justify-between gap-3 border-t border-[#e2e2e2] pt-2"
            aria-label={t("total")}
          >
            <dt className="font-semibold text-[#222]">{t("total")}</dt>
            <dd className="text-base font-bold tabular-nums text-[#222]">
              {formatAmount(total)}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg bg-primary/[0.06] px-3 py-2.5 ring-1 ring-primary/15">
            <dt className="flex items-center gap-2 font-semibold text-primary">
              <Wallet className="h-4 w-4 shrink-0" aria-hidden />
              {t("yourCommission")}
            </dt>
            <dd className="text-base font-bold tabular-nums text-primary">
              {formatAmount(commission)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
};
