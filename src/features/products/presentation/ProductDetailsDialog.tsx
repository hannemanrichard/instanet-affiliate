"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Copy, ImageIcon } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/utils/utils";
import type { ProductEntity, ProductPageEntity } from "../domain";

type ProductDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: ProductPageEntity | null;
  product?: ProductEntity;
  heroImage?: string;
  isDownloadingAssets?: boolean;
  onCopyLink: (slug: string) => void;
  onDownloadAssets?: (page: ProductPageEntity) => void;
};

const formatAmount = (amount?: number | null) => {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(amount);
};

export const ProductDetailsDialog = ({
  open,
  onOpenChange,
  page,
  product,
  heroImage,
  isDownloadingAssets = false,
  onCopyLink,
  onDownloadAssets,
}: ProductDetailsDialogProps) => {
  const t = useTranslations("affiliateDashboard.products");
  const tDash = useTranslations("affiliateDashboard");

  const description =
    page?.description?.trim() ||
    page?.subheadline?.trim() ||
    product?.description?.trim() ||
    "";
  const productName = page
    ? (product?.name ?? t("productFallback", { id: page.product_id }))
    : "";

  const handleCopyClick = () => {
    if (!page) return;
    onCopyLink(page.slug);
  };

  const handleDownloadClick = () => {
    if (!page || !onDownloadAssets || isDownloadingAssets) return;
    onDownloadAssets(page);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto p-0 sm:rounded-xl">
        <div className="p-4 pb-0">
          <div
            className={cn(
              "relative flex w-full items-center overflow-hidden rounded-lg bg-muted",
              "aspect-[4/5]"
            )}
          >
            {heroImage ? (
              <Image
                src={heroImage}
                alt={page?.headline ?? ""}
                width={800}
                height={1000}
                className="h-auto w-full"
                sizes="(max-width: 640px) 100vw, 32rem"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="size-8 opacity-40" aria-hidden />
                <span className="text-xs">{t("noImage")}</span>
              </div>
            )}
          </div>
        </div>

        <DialogHeader className="space-y-1.5 px-4 text-start">
          <DialogTitle className="text-lg leading-snug">
            {page?.headline ?? ""}
          </DialogTitle>
          <DialogDescription className="text-start">
            {productName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">
              {t("commission", {
                amount: formatAmount(product?.retail_commission),
                currency: tDash("currencySymbol"),
              })}
            </Badge>
            {page?.is_freeshipping ? (
              <Badge variant="destructive">{t("freeShipping")}</Badge>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1 rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{t("retailPrice")}</p>
              <p className="font-semibold tabular-nums">
                {formatAmount(product?.retail_price)} {tDash("currencySymbol")}
              </p>
            </div>
            <div className="space-y-1 rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">
                {t("commissionLabel")}
              </p>
              <p className="font-semibold tabular-nums text-primary">
                {formatAmount(product?.retail_commission)}{" "}
                {tDash("currencySymbol")}
              </p>
            </div>
          </div>

          {description ? (
            <>
              <Separator />
              <div className="space-y-1.5">
                <p className="text-sm font-medium">{t("detailsDescription")}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </>
          ) : null}
        </div>

        <DialogFooter className="gap-2 border-t border-border p-4 sm:justify-stretch sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:flex-1"
            onClick={() => onOpenChange(false)}
            aria-label={t("closeDetails")}
          >
            {t("closeDetails")}
          </Button>
          {onDownloadAssets ? (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:flex-1"
              onClick={handleDownloadClick}
              disabled={!page || isDownloadingAssets}
              aria-busy={isDownloadingAssets}
              aria-label={
                page
                  ? t("downloadAssetsAria", { headline: page.headline })
                  : t("downloadAssets")
              }
            >
              {isDownloadingAssets ? t("downloadingAssets") : t("downloadAssets")}
            </Button>
          ) : null}
          <Button
            type="button"
            className="w-full sm:flex-1"
            onClick={handleCopyClick}
            aria-label={
              page
                ? t("copyLinkAria", { headline: page.headline })
                : t("copyLink")
            }
          >
            <Copy aria-hidden />
            {t("copyLink")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
