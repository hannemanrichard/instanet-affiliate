import type { Metadata } from "next";
import { Shell } from "@/shared/components";
import { RoleGuard } from "@/shared/components/auth/RoleGuard";
import { ProductPagesManagementView } from "@/features/products";

export const metadata: Metadata = {
  title: "Product Pages Management",
  description: "Review and manage storefront product pages.",
};

export default function ProductPagesDashboardPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <Shell>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Product Pages</h1>
            <p className="text-sm text-muted-foreground">
              Preview product landing pages and adjust content before publishing.
            </p>
          </div>
          <ProductPagesManagementView />
        </div>
      </Shell>
    </RoleGuard>
  );
}
