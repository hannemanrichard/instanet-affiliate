import type { Metadata } from "next";
import { Shell } from "@/shared/components";
import { DashboardPageHeader } from "@/shared/components/layout/DashboardPageHeader";
import { AffiliateProductPagesView } from "@/features/products";

export const metadata: Metadata = {
  title: "Products | Instanet",
  description: "Browse product pages and share them with your customers",
};

export default function ProductsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <DashboardPageHeader section="products" />
        <AffiliateProductPagesView />
      </div>
    </Shell>
  );
}
