"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { AppIcon } from "@/shared/components/layout/AppIcon";
import { uiIcons } from "@/shared/components/layout/navIcons";
import { cn } from "@/shared/utils/utils";
import { useProductPage } from "../application";
import type { ProductEntity, ProductItemEntity, ProductPageEntity } from "../domain";

type CheckStockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: ProductPageEntity | null;
  product?: ProductEntity;
};

type StockAvailability = "available" | "low" | "out";

type StockRow = {
  id: number;
  color: string;
  colorHex?: string;
  size: string;
  availability: StockAvailability;
};

/** Internal only — never shown to affiliates as a number. */
const LOW_STOCK_THRESHOLD = 5;

const resolveAvailability = (quantity: number): StockAvailability => {
  if (quantity <= 0) return "out";
  if (quantity <= LOW_STOCK_THRESHOLD) return "low";
  return "available";
};

const buildStockRows = (items: ProductItemEntity[]): StockRow[] =>
  items
    .map((item) => ({
      id: item.id,
      color: item.color?.trim() || "—",
      colorHex: item.colorHex?.trim() || undefined,
      size: item.size?.trim() || "—",
      availability: resolveAvailability(item.quantity ?? 0),
    }))
    .sort((a, b) => {
      const colorCmp = a.color.localeCompare(b.color);
      if (colorCmp !== 0) return colorCmp;
      return a.size.localeCompare(b.size);
    });

const availabilityIcon = (availability: StockAvailability) => {
  if (availability === "out") return uiIcons.packageRemove;
  if (availability === "low") return uiIcons.packageProcess;
  return uiIcons.packageDelivered;
};

const availabilityClass = (availability: StockAvailability) => {
  if (availability === "out") return "text-muted-foreground/45";
  if (availability === "low") return "text-amber-500";
  return "text-emerald-500";
};

export const CheckStockDialog = ({
  open,
  onOpenChange,
  page,
  product,
}: CheckStockDialogProps) => {
  const t = useTranslations("affiliateDashboard.products");
  const slug = open && page?.slug ? page.slug : "";
  const pageQuery = useProductPage(slug);

  const rows = useMemo(
    () => buildStockRows(pageQuery.data?.items ?? []),
    [pageQuery.data?.items]
  );

  const title = page?.headline?.trim() || product?.name || t("checkStockTitle");
  const productName =
    product?.name?.trim() ||
    (page ? t("productFallback", { id: page.product_id }) : "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="space-y-1.5 border-b border-border px-4 py-4 text-start">
          <DialogTitle className="text-lg leading-snug">
            {t("checkStockTitle")}
          </DialogTitle>
          <DialogDescription className="text-start">
            <span className="block font-medium text-foreground">{title}</span>
            {productName && productName !== title ? (
              <span className="block text-muted-foreground">{productName}</span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(60vh,28rem)] overflow-y-auto px-4 py-3">
          {pageQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : pageQuery.isError ? (
            <Alert variant="destructive">
              <AlertDescription>{t("checkStockError")}</AlertDescription>
            </Alert>
          ) : rows.length === 0 ? (
            <Alert>
              <AlertDescription>{t("checkStockEmpty")}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t("checkStockVariants", { count: rows.length })}
              </p>

              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-start text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">
                        {t("checkStockColor")}
                      </th>
                      <th className="px-3 py-2 font-medium">
                        {t("checkStockSize")}
                      </th>
                      <th className="px-3 py-2 text-end font-medium">
                        {t("checkStockAvailability")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((row) => {
                      const label =
                        row.availability === "out"
                          ? t("checkStockOut")
                          : row.availability === "low"
                            ? t("checkStockLow")
                            : t("checkStockAvailable");

                      return (
                        <tr key={row.id} className="bg-background">
                          <td className="px-3 py-2.5">
                            <div className="flex min-w-0 items-center gap-2">
                              {row.colorHex ? (
                                <span
                                  className="size-4 shrink-0 rounded-full border border-border"
                                  style={{ backgroundColor: row.colorHex }}
                                  aria-hidden
                                />
                              ) : (
                                <span
                                  className="size-4 shrink-0 rounded-full border border-dashed border-border bg-muted"
                                  aria-hidden
                                />
                              )}
                              <span className="truncate font-medium">
                                {row.color}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                            {row.size}
                          </td>
                          <td className="px-3 py-2.5 text-end">
                            <span
                              className={cn(
                                "inline-flex items-center justify-end",
                                availabilityClass(row.availability)
                              )}
                              title={label}
                              aria-label={label}
                            >
                              <AppIcon
                                icon={availabilityIcon(row.availability)}
                                size={18}
                                strokeWidth={0}
                              />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 text-emerald-500">
                  <AppIcon
                    icon={uiIcons.packageDelivered}
                    size={14}
                    strokeWidth={0}
                  />
                  {t("checkStockAvailable")}
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-500">
                  <AppIcon
                    icon={uiIcons.packageProcess}
                    size={14}
                    strokeWidth={0}
                  />
                  {t("checkStockLow")}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground/45">
                  <AppIcon
                    icon={uiIcons.packageRemove}
                    size={14}
                    strokeWidth={0}
                  />
                  {t("checkStockOut")}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border p-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
            aria-label={t("closeDetails")}
          >
            {t("closeDetails")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
