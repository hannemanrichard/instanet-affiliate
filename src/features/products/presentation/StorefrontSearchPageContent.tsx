"use client";

import { useTranslations } from "next-intl";
import { ProductCatalogSection } from "./ProductCatalogSection";

interface StorefrontSearchPageContentProps {
  initialSearchTerm: string;
}

export const StorefrontSearchPageContent = ({
  initialSearchTerm,
}: StorefrontSearchPageContentProps) => {
  const t = useTranslations("storefront.search");

  return (
    <div className="container mx-auto space-y-10 px-4">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>
      <ProductCatalogSection initialSearchTerm={initialSearchTerm} />
    </div>
  );
};

