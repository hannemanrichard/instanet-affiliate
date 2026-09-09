"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { DataTable } from "@/shared/components/ui/data-table/data-table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { AppIcon } from "@/shared/components/layout/AppIcon";
import { uiIcons } from "@/shared/components/layout/navIcons";
import { useToast } from "@/shared/hooks/use-toast";
import { formatRelativeDate } from "@/shared/utils/formatRelativeDate";
import { cn } from "@/shared/utils/utils";
import { CreateOrderDialog } from "@/features/orders/presentation/CreateOrderDialog";
import {
  MarketplaceExtensionInstallDialog,
  openMarketplaceDraft,
  pingMarketplaceExtension,
} from "@/features/marketplace-extension";
import { apiFetch } from "@/shared/utils/apiFetch";
import { getPublicProductPageUrl } from "@/shared/config/productPageUrl";
import { useActiveProductPages, useAdminProducts } from "../application";
import type { ProductEntity, ProductPageEntity } from "../domain";
import { ProductDetailsDialog } from "./ProductDetailsDialog";
import { CheckStockDialog } from "./CheckStockDialog";
import { extractProductPageHeroUrl } from "./productPageMedia";

const PAGE_SIZE = 25;

type ProductPageRow = ProductPageEntity & {
  product?: ProductEntity;
  thumbnail?: string;
};

const formatAmount = (amount?: number | null) => {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(amount);
};

const ProductNameCell = ({
  row,
  noImageLabel,
}: {
  row: ProductPageRow;
  noImageLabel: string;
}) => {
  const title = row.headline?.trim() || row.product?.name || "—";
  const subtitle = row.product?.name?.trim();

  return (
    <div className="flex min-w-0 items-center gap-3">
      {row.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.thumbnail}
          alt=""
          className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
        />
      ) : (
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border"
          title={noImageLabel}
          aria-hidden
        >
          <AppIcon
            icon={uiIcons.imageEmpty}
            size={16}
            className="text-muted-foreground"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium leading-tight">{title}</span>
        {subtitle && subtitle !== title ? (
          <span className="truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
};

const ProductCommissionCell = ({
  commission,
  currency,
  label,
}: {
  commission?: number | null;
  currency: string;
  label: string;
}) => (
  <span
    className={cn(
      "inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border px-2.5",
      "border-emerald-200/80 bg-[#EEFBF4] text-emerald-800",
      "text-[11px] font-semibold leading-none tracking-wide tabular-nums",
      "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)]"
    )}
    title={label}
  >
    <span
      className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700"
      aria-hidden
    >
      <AppIcon icon={uiIcons.wallet} size={11} />
    </span>
    <span className="sr-only">{label}</span>
    <span>{formatAmount(commission)}</span>
    <span className="text-[10px] font-medium text-emerald-700/70">
      {currency}
    </span>
  </span>
);

const ProductPriceCell = ({
  price,
  currency,
  label,
}: {
  price?: number | null;
  currency: string;
  label: string;
}) => (
  <span
    className="inline-flex items-center gap-1 text-sm tabular-nums text-foreground"
    title={label}
  >
    <span className="sr-only">{label}</span>
    <span>{formatAmount(price)}</span>
    <span className="text-xs font-medium text-muted-foreground">{currency}</span>
  </span>
);

const ProductRowActions = ({
  row,
  isDownloading,
  onView,
  onCopyLink,
  onCreateOrder,
  onDownloadAssets,
  onCheckStock,
  onPublishMarketplace,
}: {
  row: ProductPageRow;
  isDownloading: boolean;
  onView: (page: ProductPageEntity) => void;
  onCopyLink: (slug: string) => void;
  onCreateOrder: (page: ProductPageEntity) => void;
  onDownloadAssets: (page: ProductPageEntity) => void;
  onCheckStock: (page: ProductPageEntity) => void;
  onPublishMarketplace: (page: ProductPageEntity) => void;
}) => {
  const t = useTranslations("affiliateDashboard.products");

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center justify-end gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="default"
              size="icon"
              className="size-8 shrink-0 shadow-sm"
              onClick={() => onCreateOrder(row)}
              aria-label={t("createOrderAria", { headline: row.headline })}
            >
              <AppIcon icon={uiIcons.newOrder} size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="font-medium">
            {t("createOrder")}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="size-8 shrink-0 bg-accent text-primary shadow-none hover:bg-accent/80 hover:text-primary"
              onClick={() => onPublishMarketplace(row)}
              aria-label={t("publishMarketplaceAria", {
                headline: row.headline,
              })}
            >
              <AppIcon icon={uiIcons.store} size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="font-medium">
            {t("publishMarketplace")}
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              aria-label={t("moreActionsAria", { headline: row.headline })}
            >
              <AppIcon icon={uiIcons.more} size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuItem onClick={() => onCheckStock(row)}>
              <AppIcon icon={uiIcons.inventory} size={16} />
              {t("checkStock")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDownloadAssets(row)}
              disabled={isDownloading}
            >
              <AppIcon icon={uiIcons.download} size={16} />
              {isDownloading ? t("downloadingAssets") : t("downloadAssets")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onView(row)}>
              <AppIcon icon={uiIcons.view} size={16} />
              {t("view")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopyLink(row.slug)}>
              <AppIcon icon={uiIcons.copy} size={16} />
              {t("copyLink")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
};

export const AffiliateProductPagesView = () => {
  const t = useTranslations("affiliateDashboard.products");
  const tDash = useTranslations("affiliateDashboard");
  const locale = useLocale();
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPage, setSelectedPage] = useState<ProductPageEntity | null>(
    null
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [orderPage, setOrderPage] = useState<ProductPageEntity | null>(null);
  const [stockPage, setStockPage] = useState<ProductPageEntity | null>(null);
  const [downloadingSlug, setDownloadingSlug] = useState<string | null>(null);
  const [extensionInstallOpen, setExtensionInstallOpen] = useState(false);
  const pagesQuery = useActiveProductPages();
  const productsQuery = useAdminProducts();

  const productMap = useMemo(() => {
    const map = new Map<number, ProductEntity>();
    (productsQuery.data ?? []).forEach((product) => {
      map.set(product.id, product);
    });
    return map;
  }, [productsQuery.data]);

  const filteredRows = useMemo(() => {
    const pages = pagesQuery.data ?? [];
    const term = appliedSearch.trim().toLowerCase();

    return pages
      .filter((productPage) => {
        if (!term) return true;
        const product = productMap.get(productPage.product_id);
        return (
          productPage.headline.toLowerCase().includes(term) ||
          productPage.slug.toLowerCase().includes(term) ||
          (product?.name.toLowerCase().includes(term) ?? false)
        );
      })
      .map((productPage): ProductPageRow => {
        const product = productMap.get(productPage.product_id);
        return {
          ...productPage,
          product,
          thumbnail: extractProductPageHeroUrl(productPage.hero_media),
        };
      });
  }, [appliedSearch, pagesQuery.data, productMap]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const isLoading = pagesQuery.isLoading || productsQuery.isLoading;

  const selectedProduct = selectedPage
    ? productMap.get(selectedPage.product_id)
    : undefined;
  const selectedHero = selectedPage
    ? extractProductPageHeroUrl(selectedPage.hero_media)
    : undefined;

  const handleApplySearch = () => {
    const next = searchInput.trim();
    setSearchInput(next);
    setAppliedSearch(next);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleApplySearch();
  };

  const handleCopyLink = async (slug: string) => {
    const url = getPublicProductPageUrl(slug);
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: t("toast.copiedTitle"),
        description: t("toast.copiedDescription"),
      });
    } catch {
      toast({
        title: t("toast.copyFailedTitle"),
        description: t("toast.copyFailedDescription"),
        variant: "destructive",
      });
    }
  };

  const handleView = (productPage: ProductPageEntity) => {
    setSelectedPage(productPage);
    setDetailsOpen(true);
  };

  const handleCreateOrder = (productPage: ProductPageEntity) => {
    setOrderPage(productPage);
  };

  const handleCheckStock = (productPage: ProductPageEntity) => {
    setStockPage(productPage);
  };

  const handleDownloadAssets = async (productPage: ProductPageEntity) => {
    if (downloadingSlug) return;

    setDownloadingSlug(productPage.slug);
    try {
      const response = await fetch(
        `/api/product-pages/by-slug/${encodeURIComponent(productPage.slug)}/assets`
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(
          typeof payload.error === "string"
            ? payload.error
            : t("toast.downloadFailedDescription")
        );
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const safeSlug =
        productPage.slug.replace(/[^a-zA-Z0-9-_]/g, "-") || "product";
      anchor.href = objectUrl;
      anchor.download = `${safeSlug}-assets.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);

      toast({
        title: t("toast.downloadSuccessTitle"),
        description: t("toast.downloadSuccessDescription"),
      });
    } catch {
      toast({
        title: t("toast.downloadFailedTitle"),
        description: t("toast.downloadFailedDescription"),
        variant: "destructive",
      });
    } finally {
      setDownloadingSlug(null);
    }
  };

  const handlePublishMarketplace = async (productPage: ProductPageEntity) => {
    const installed = await pingMarketplaceExtension();
    if (!installed) {
      setExtensionInstallOpen(true);
      return;
    }

    try {
      const library = await apiFetch<{
        product_page_id: number;
        slug: string;
        assets: Array<{ id: number; url: string }>;
      }>(
        `/api/product-pages/by-slug/${encodeURIComponent(productPage.slug)}/library`
      );

      const imageUrls = library.assets.map((asset) => asset.url);
      if (imageUrls.length === 0) {
        toast({
          title: t("toast.marketplaceNoAssetsTitle"),
          description: t("toast.marketplaceNoAssetsDescription"),
          variant: "destructive",
        });
        return;
      }

      const product = productMap.get(productPage.product_id);
      const title = productPage.headline?.trim() || product?.name || "Product";
      const price = product?.retail_price ?? 0;
      const currency = tDash("currencySymbol");

      const tracking = await apiFetch<{
        attempt_id: number;
        attempt_token: string;
        api_base_url: string;
      }>("/api/marketplace-posts", {
        method: "POST",
        body: JSON.stringify({
          product_page_id: productPage.id,
          product_title: title,
          product_price: price,
          currency,
          slug: productPage.slug,
        }),
      });

      const result = await openMarketplaceDraft({
        product_page_id: productPage.id,
        slug: productPage.slug,
        title,
        price,
        currency,
        description:
          productPage.subheadline?.trim() ||
          productPage.description?.trim() ||
          "",
        image_urls: imageUrls,
        order_link: getPublicProductPageUrl(productPage.slug),
        default_contact_method: "phone",
        condition: "new",
        country: "DZ",
        attempt_id: tracking.attempt_id,
        attempt_token: tracking.attempt_token,
        api_base_url: tracking.api_base_url,
      });

      if (!result.ok) {
        toast({
          title: t("toast.marketplaceOpenFailedTitle"),
          description:
            result.error || t("toast.marketplaceOpenFailedDescription"),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t("toast.marketplaceOpenedTitle"),
        description: t("toast.marketplaceOpenedDescription"),
      });
    } catch {
      toast({
        title: t("toast.marketplaceOpenFailedTitle"),
        description: t("toast.marketplaceOpenFailedDescription"),
        variant: "destructive",
      });
    }
  };

  const handleCreateOrderOpenChange = (open: boolean) => {
    if (!open) {
      setOrderPage(null);
    }
  };

  const handleStockOpenChange = (open: boolean) => {
    if (!open) {
      setStockPage(null);
    }
  };

  const handleDetailsOpenChange = (open: boolean) => {
    setDetailsOpen(open);
  };

  const stockProduct = stockPage
    ? productMap.get(stockPage.product_id)
    : undefined;

  const columns = [
    {
      key: "product",
      label: t("columns.product"),
      render: (row: ProductPageRow) => (
        <ProductNameCell row={row} noImageLabel={t("noImage")} />
      ),
    },
    {
      key: "commission",
      label: t("columns.commission"),
      render: (row: ProductPageRow) => (
        <ProductCommissionCell
          commission={row.product?.retail_commission}
          currency={tDash("currencySymbol")}
          label={t("commissionLabel")}
        />
      ),
    },
    {
      key: "price",
      label: t("columns.price"),
      render: (row: ProductPageRow) => (
        <ProductPriceCell
          price={row.product?.retail_price}
          currency={tDash("currencySymbol")}
          label={t("retailPrice")}
        />
      ),
    },
    {
      key: "created_at",
      label: t("columns.created"),
      render: (row: ProductPageRow) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatRelativeDate(row.created_at, locale)}
        </span>
      ),
    },
    {
      key: "actions",
      label: t("columns.actions"),
      render: (row: ProductPageRow) => (
        <ProductRowActions
          row={row}
          isDownloading={downloadingSlug === row.slug}
          onView={handleView}
          onCopyLink={handleCopyLink}
          onCreateOrder={handleCreateOrder}
          onDownloadAssets={handleDownloadAssets}
          onCheckStock={handleCheckStock}
          onPublishMarketplace={handlePublishMarketplace}
        />
      ),
    },
  ];

  return (
    <div className="min-w-0 space-y-4">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-0 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground sm:start-3"
                strokeWidth={1.75}
                aria-hidden
              />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={t("searchPlaceholder")}
                className={cn(
                  "h-11 border-0 bg-transparent pe-11 ps-11 shadow-none",
                  "placeholder:text-muted-foreground/70",
                  "focus-visible:ring-0",
                  "sm:h-9 sm:border sm:border-input sm:bg-background sm:pe-9 sm:ps-9 sm:shadow-sm",
                  "sm:focus-visible:ring-1 sm:focus-visible:ring-ring"
                )}
                aria-label={t("searchAria")}
              />
              {searchInput ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute end-1.5 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground sm:end-1 sm:size-7"
                  onClick={handleClearSearch}
                  aria-label={t("clearSearch")}
                >
                  <X className="size-3.5" strokeWidth={2} aria-hidden />
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <Skeleton className="h-72 w-full rounded-none" />
          ) : filteredRows.length === 0 ? (
            <div className="border-t px-4 py-10 sm:px-6">
              <Alert>
                <AlertDescription>{t("empty")}</AlertDescription>
              </Alert>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={pagedRows}
              totalItems={filteredRows.length}
              currentPage={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              emptyLabel={t("empty")}
              showToolbar={false}
              showColumnToggle={false}
              showPageSizeSelector={false}
              embedded
            />
          )}
        </CardContent>
      </Card>

      <ProductDetailsDialog
        open={detailsOpen}
        onOpenChange={handleDetailsOpenChange}
        page={selectedPage}
        product={selectedProduct}
        heroImage={selectedHero}
        isDownloadingAssets={
          selectedPage != null && downloadingSlug === selectedPage.slug
        }
        onCopyLink={handleCopyLink}
        onDownloadAssets={handleDownloadAssets}
      />

      <CheckStockDialog
        open={stockPage != null}
        onOpenChange={handleStockOpenChange}
        page={stockPage}
        product={stockProduct}
      />

      <CreateOrderDialog
        key={orderPage?.id ?? "closed"}
        open={orderPage != null}
        onOpenChange={handleCreateOrderOpenChange}
        lockedProductPage={orderPage ?? undefined}
      />

      <MarketplaceExtensionInstallDialog
        open={extensionInstallOpen}
        onOpenChange={setExtensionInstallOpen}
        title={t("extensionInstall.title")}
        description={t("extensionInstall.description")}
        steps={[
          t("extensionInstall.step1"),
          t("extensionInstall.step2"),
          t("extensionInstall.step3"),
        ]}
        installLabel={t("extensionInstall.install")}
        closeLabel={t("extensionInstall.close")}
      />
    </div>
  );
};
