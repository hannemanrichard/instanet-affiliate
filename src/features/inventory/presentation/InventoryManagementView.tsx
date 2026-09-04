"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useAdminProducts } from "@/features/products";
import { useRefreshPhaseDetailsView } from "../application/useInventory";
import { InventoryProductAccordion } from "./InventoryProductAccordion";
import { InventorySoldUnitsByDateRangeCard } from "./InventorySoldUnitsByDateRangeCard";

export const InventoryManagementView = () => {
  const productsQuery = useAdminProducts();
  const products = productsQuery.data ?? [];
  const refreshPhaseDetailsView = useRefreshPhaseDetailsView();

  const sortedProducts = useMemo(
    () => products.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  );

  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const handleRefresh = () => {
    refreshPhaseDetailsView.mutate(undefined, {
      onSuccess: () => {
        productsQuery.refetch();
      },
    });
  };

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return (
      sortedProducts.find(
        (product) => product.id.toString() === selectedProductId,
      ) ?? null
    );
  }, [selectedProductId, sortedProducts]);

  if (productsQuery.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (sortedProducts.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
        No products found. Create a product to start managing inventory.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Inventory Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose a product to review inventory details and adjust stock
            levels.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="w-full max-w-sm space-y-2">
            <Label
              htmlFor="inventory-product-select"
              className="text-sm font-medium"
            >
              Product
            </Label>
            <Select
              value={selectedProductId || undefined}
              onValueChange={setSelectedProductId}
            >
              <SelectTrigger
                id="inventory-product-select"
                className="w-full"
                aria-label="Select product to manage inventory"
              >
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {sortedProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshPhaseDetailsView.isPending}
            variant="outline"
            size="default"
            className="whitespace-nowrap"
            aria-label="Refresh inventory phase details"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshPhaseDetailsView.isPending ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <InventorySoldUnitsByDateRangeCard />

      {selectedProduct ? (
        <InventoryProductAccordion
          key={selectedProduct.id}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          productThumbnail={selectedProduct.thumbnail ?? undefined}
        />
      ) : (
        <div className="rounded-lg border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
          Select a product to display its inventory details.
        </div>
      )}
    </div>
  );
};
