"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { DataTable } from "@/shared/components/ui/data-table/data-table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAuth } from "@/shared/hooks/use-auth";
import { formatRelativeDate } from "@/shared/utils/formatRelativeDate";
import { cn } from "@/shared/utils/utils";
import { useAdminProducts } from "@/features/products";
import { AffiliateProductPagesView } from "@/features/products/presentation/AffiliateProductPagesView";
import { ProductPagesManagementView } from "@/features/products/presentation/ProductPagesManagementView";
import type { ProductEntity } from "@/features/products/domain";

type AdminProductsTab = "pages" | "products";

const formatAmount = (amount?: number | null) => {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(amount);
};

const AdminProductsList = () => {
  const productsQuery = useAdminProducts();
  const locale = useLocale();
  const tDash = useTranslations("affiliateDashboard");

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Product",
        render: (product: ProductEntity) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{product.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              #{product.id}
            </p>
          </div>
        ),
      },
      {
        key: "price",
        label: "Retail Price",
        render: (product: ProductEntity) => (
          <span className="tabular-nums">
            {formatAmount(product.retail_price)} {tDash("currencySymbol")}
          </span>
        ),
      },
      {
        key: "commission",
        label: "Commission",
        render: (product: ProductEntity) => (
          <span className="tabular-nums">
            {formatAmount(product.retail_commission)} {tDash("currencySymbol")}
          </span>
        ),
      },
      {
        key: "created_at",
        label: "Created",
        render: (product: ProductEntity) => (
          <span className="text-muted-foreground">
            {formatRelativeDate(product.created_at, locale)}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (product: ProductEntity) => (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/products/edit/${product.id}`}>Edit</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/dashboard/products/${product.id}`}>Open</Link>
            </Button>
          </div>
        ),
      },
    ],
    [locale, tDash]
  );

  if (productsQuery.isLoading) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  if (productsQuery.isError) {
    return (
      <Alert>
        <AlertDescription>Unable to load products.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <DataTable
          columns={columns}
          data={productsQuery.data ?? []}
          emptyLabel="No products found."
          showToolbar={false}
          showColumnToggle={false}
          embedded
        />
      </CardContent>
    </Card>
  );
};

export const ProductsDashboardView = () => {
  const { isAdmin, isLoaded } = useAuth();
  const [tab, setTab] = useState<AdminProductsTab>("pages");

  if (!isLoaded) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  if (!isAdmin) {
    return <AffiliateProductPagesView />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={tab === "pages" ? "default" : "outline"}
            onClick={() => setTab("pages")}
            className={cn("min-w-28")}
          >
            Product Pages
          </Button>
          <Button
            type="button"
            variant={tab === "products" ? "default" : "outline"}
            onClick={() => setTab("products")}
            className={cn("min-w-28")}
          >
            Products
          </Button>
        </CardHeader>
      </Card>

      {tab === "pages" ? <ProductPagesManagementView /> : <AdminProductsList />}
    </div>
  );
};
