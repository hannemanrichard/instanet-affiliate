"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useProductCatalog, useProductPageSearch } from "../application";
import type { ProductCatalogEntry, ProductPageEntity } from "../domain";

interface ProductCatalogGridProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onSelectPage?: (page: ProductPageEntity) => void;
  hideSearch?: boolean;
}

const extractHeroImage = (heroMedia: ProductPageEntity["hero_media"]) => {
  if (!heroMedia || heroMedia.length === 0) return undefined;
  const [first] = heroMedia;
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && "url" in first) {
    return (first as { url: string }).url;
  }
  return undefined;
};

export const ProductCatalogGrid = ({
  searchTerm,
  onSearchChange,
  onSelectPage,
  hideSearch = false,
}: ProductCatalogGridProps) => {
  const t = useTranslations("storefront.search");
  const formatter = useFormatter();
  const [internalSearch, setInternalSearch] = useState(searchTerm ?? "");
  const searchValue = hideSearch ? "" : (searchTerm ?? internalSearch);

  const handleSearchInput = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearch(value);
    }
  };

  const pagesQuery = useProductPageSearch(searchValue);
  const catalogQuery = useProductCatalog();

  const catalogMap = useMemo(() => {
    const map = new Map<number, ProductCatalogEntry>();
    (catalogQuery.data ?? []).forEach((entry) => {
      map.set(entry.id, entry);
    });
    return map;
  }, [catalogQuery.data]);

  const isLoading = pagesQuery.isLoading || catalogQuery.isLoading;

  const formatCurrency = (amount?: number | null) => {
    if (amount == null) return "—";
    // Always use Western Arabic numerals (0-9) regardless of locale
    const formattedNumber = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
      numberingSystem: "latn",
    }).format(amount);
    return `${formattedNumber}${t("currencySymbol")}`;
  };

  return (
    <div className="space-y-4">
      {!hideSearch && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            value={searchValue}
            placeholder={t("inputPlaceholder")}
            onChange={(event) => handleSearchInput(event.target.value)}
            className="md:w-80"
          />
          <div className="text-sm text-muted-foreground">
            {t("results", { count: pagesQuery.data?.length ?? 0 })}
          </div>
        </div>
      )}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="group overflow-hidden rounded-lg bg-white transition-shadow hover:shadow-lg"
            >
              <Skeleton className="aspect-[800/1035] w-full" />
              <div className="p-4">
                <Skeleton className="mb-2 h-5 w-full" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {(pagesQuery.data ?? []).map((page, index) => {
            const catalogEntry = catalogMap.get(page.product_id);
            const hero = extractHeroImage(page.hero_media);
            const price = formatCurrency(catalogEntry?.price);
            const handleCardClick = () => onSelectPage?.(page);

            return (
              <Link
                key={page.id}
                href={`/products/${page.slug}`}
                onClick={handleCardClick}
                className="group flex flex-col overflow-hidden rounded-lg border border-gray-100"
                aria-label={t("cardAria", { headline: page.headline })}
              >
                {hero ? (
                  <div className="relative aspect-[800/1035] w-full min-h-0 rounded-lg overflow-hidden bg-[#fafafa]">
                    <Image
                      src={hero}
                      alt={page.headline}
                      fill
                      priority={index < 8}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      quality={85}
                    />
                  </div>
                ) : (
                  <div className="relative flex aspect-[800/1035] items-center justify-center bg-[#fafafa] text-sm text-muted-foreground">
                    {t("imagePlaceholder")}
                  </div>
                )}

                <div className="pt-2 pb-3 flex flex-col items-center gap-1">
                  <h3 className="mb-1 line-clamp-2 text-center text-sm text-slate-700 text-[#222]">
                    {page.headline}
                  </h3>
                  <div className="font-semibold text-black text-center">
                    {price}
                  </div>
                  {page.is_freeshipping ? (
                    <span className="mt-1 inline-flex items-center rounded-full border border-red-500 bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600 shadow-sm">
                      {t("freeShipping")}
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
      {pagesQuery.data && pagesQuery.data.length === 0 && !isLoading ? (
        <div className="rounded-2xl border border-dashed border-muted-foreground/40 bg-white py-12 text-center text-sm text-muted-foreground shadow-sm">
          {t("empty", { query: searchValue })}
        </div>
      ) : null}
    </div>
  );
};
