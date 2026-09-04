"use client";

import Image from "next/image";
import { useMemo, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { AppIcon } from "@/shared/components/layout/AppIcon";
import { uiIcons } from "@/shared/components/layout/navIcons";
import { cn } from "@/shared/utils/utils";
import { useActiveProductPages } from "../application";
import type { ProductPageEntity } from "../domain";
import { extractProductPageHeroUrl } from "./productPageMedia";

type SelectProductGridProps = {
  selectedPageId?: number | null;
  onSelect: (page: ProductPageEntity) => void;
};

const GRID_IMAGE_ASPECT = "aspect-[4/5]";

const matchesSearch = (page: ProductPageEntity, term: string) => {
  if (!term) return true;
  return (
    page.headline.toLowerCase().includes(term) ||
    page.slug.toLowerCase().includes(term)
  );
};

export const SelectProductGrid = ({
  selectedPageId,
  onSelect,
}: SelectProductGridProps) => {
  const t = useTranslations("affiliateDashboard.products.selectGrid");
  const [search, setSearch] = useState("");
  const pagesQuery = useActiveProductPages();
  const pages = pagesQuery.data ?? [];

  const filteredPages = useMemo(() => {
    const term = search.trim().toLowerCase();
    return pages.filter((page) => matchesSearch(page, term));
  }, [pages, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSelect = (page: ProductPageEntity) => {
    onSelect(page);
  };

  const handleTileKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    page: ProductPageEntity
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(page);
    }
  };

  return (
    <div className="space-y-3">
      <Input
        value={search}
        onChange={(event) => handleSearchChange(event.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchAria")}
      />

      {pagesQuery.isLoading ? (
        <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={index}
              className={cn("w-full rounded-lg", GRID_IMAGE_ASPECT)}
            />
          ))}
        </div>
      ) : (
        <div
          role="radiogroup"
          aria-label={t("groupAria")}
          className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4"
        >
          {filteredPages.map((page) => {
            const heroUrl = extractProductPageHeroUrl(page.hero_media);
            const isSelected = selectedPageId === page.id;

            return (
              <div
                key={page.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                aria-label={t("selectAria", { headline: page.headline })}
                onClick={() => handleSelect(page)}
                onKeyDown={(event) => handleTileKeyDown(event, page)}
                className={cn(
                  "relative overflow-hidden rounded-lg border-[3px] bg-muted shadow-none outline-none ring-0 ring-offset-0 transition focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
                  GRID_IMAGE_ASPECT,
                  isSelected
                    ? "border-primary"
                    : "border-transparent hover:border-primary/40"
                )}
              >
                {heroUrl ? (
                  <Image
                    src={heroUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                    <AppIcon
                      icon={uiIcons.imageEmpty}
                      size={20}
                      className="opacity-40"
                    />
                    <span className="px-1 text-center text-[10px] leading-tight">
                      {t("noImage")}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!pagesQuery.isLoading && filteredPages.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : null}
    </div>
  );
};
