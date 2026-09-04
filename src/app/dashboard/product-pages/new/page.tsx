import type { Metadata } from "next";
import { Shell } from "@/shared/components";
import { RoleGuard } from "@/shared/components/auth/RoleGuard";
import { ProductPageCreateView } from "@/features/products";

export const metadata: Metadata = {
  title: "Create Product Page",
  description: "Compose a new storefront product page.",
};

export default function NewProductPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <Shell>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create product page
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure product content, hero messaging, and assign variants.
            </p>
          </div>
          <ProductPageCreateView />
        </div>
      </Shell>
    </RoleGuard>
  );
}
