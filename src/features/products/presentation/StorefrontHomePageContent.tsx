"use client";

import { ProductCatalogSection } from "./ProductCatalogSection";
import { StickyCallButton } from "@/shared/components/layout/StickyCallButton";

export const StorefrontHomePageContent = () => {
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <ProductCatalogSection hideSearch />
      </div>
      <StickyCallButton />
    </>
  );
};
