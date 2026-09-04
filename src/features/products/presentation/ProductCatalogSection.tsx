"use client";

import { useState } from "react";
import { ProductCatalogGrid } from "./ProductCatalogGrid";

interface ProductCatalogSectionProps {
  initialSearchTerm?: string;
  onSelectPage?: (slug: string) => void;
  hideSearch?: boolean;
}

export const ProductCatalogSection = ({
  initialSearchTerm,
  onSelectPage,
  hideSearch = false,
}: ProductCatalogSectionProps) => {
  const [search, setSearch] = useState(initialSearchTerm ?? "");

  return (
    <ProductCatalogGrid
      searchTerm={hideSearch ? undefined : search}
      onSearchChange={hideSearch ? undefined : setSearch}
      onSelectPage={(page) => onSelectPage?.(page.slug)}
      hideSearch={hideSearch}
    />
  );
};
