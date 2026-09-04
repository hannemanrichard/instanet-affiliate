import React from "react";
import { Metadata } from "next";
import { ProductEditor } from "@/features/products/presentation/ProductEditor";
import { RoleGuard } from "@/shared/components/auth/RoleGuard";
import { Button } from "@/shared/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface ProductPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  return {
    title: `Product ${productId} | Instanet`,
    description: "Product details and performance metrics",
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Product Details</h1>
            <p className="text-sm text-muted-foreground">
              View and manage product information
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/products">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>

        <ProductEditor productId={Number(productId)} />
      </div>
    </RoleGuard>
  );
}
