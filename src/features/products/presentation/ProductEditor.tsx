"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProduct, useProductItems, useUpdateProduct } from "../application";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { UploadArea } from "@/shared/components/ui/upload-area";

interface ProductEditorProps {
  productId: number;
}

const parseOptionalNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed.length) {
    return undefined;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return parsed;
};

export const ProductEditor = ({ productId }: ProductEditorProps) => {
  const router = useRouter();
  const productQuery = useProduct(productId);
  const product = productQuery.data;
  const itemsQuery = useProductItems(productId);
  const updateMutation = useUpdateProduct();

  const [name, setName] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [retailPrice2, setRetailPrice2] = useState("");
  const [retailPrice3, setRetailPrice3] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [retailCommission, setRetailCommission] = useState("");
  const [wholesaleCommission, setWholesaleCommission] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const baseId = useId();
  const nameInputId = `${baseId}-name`;
  const categoryInputId = `${baseId}-category`;
  const retailPriceInputId = `${baseId}-retail-price`;
  const retailPrice2InputId = `${baseId}-retail-price-two`;
  const retailPrice3InputId = `${baseId}-retail-price-three`;
  const wholesalePriceInputId = `${baseId}-wholesale-price`;
  const retailCommissionInputId = `${baseId}-retail-commission`;
  const wholesaleCommissionInputId = `${baseId}-wholesale-commission`;
  const weightInputId = `${baseId}-weight`;
  const descriptionInputId = `${baseId}-description`;

  useEffect(() => {
    if (!product) {
      return;
    }

    setName(product.name ?? "");
    setRetailPrice(
      product.retail_price != null ? String(product.retail_price) : ""
    );
    setRetailPrice2(
      product.retail_price_2 != null ? String(product.retail_price_2) : ""
    );
    setRetailPrice3(
      product.retail_price_3 != null ? String(product.retail_price_3) : ""
    );
    setWholesalePrice(
      product.wholesale_price != null ? String(product.wholesale_price) : ""
    );
    setRetailCommission(
      product.retail_commission != null ? String(product.retail_commission) : ""
    );
    setWholesaleCommission(
      product.wholesale_commission != null
        ? String(product.wholesale_commission)
        : ""
    );
    setWeight(product.weight != null ? String(product.weight) : "");
    setDescription(product.description ?? "");
    setCategory(product.category ?? "");
    setThumbnail(product.thumbnail ?? "");
  }, [product]);

  const isSaving = updateMutation.isPending;
  const isLoading = productQuery.isLoading || itemsQuery.isLoading;

  const variantsPreview = useMemo(() => {
    return (itemsQuery.data ?? []).slice(0, 6);
  }, [itemsQuery.data]);

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="product-editor-skeleton">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full rounded-3xl" />
        <Skeleton className="h-[420px] w-full rounded-3xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <Card className="rounded-3xl border border-[#f0f0f0] shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <CardContent className="p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Product not found. It may have been deleted.
          </p>
          <Button
            className="mt-6"
            onClick={() => router.push("/dashboard/products")}
          >
            Back to products
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName.length) {
      setValidationError("Product name is required.");
      return;
    }

    const primaryPrice = Number(retailPrice.trim());
    if (!Number.isFinite(primaryPrice) || primaryPrice <= 0) {
      setValidationError("Retail price must be a number greater than zero.");
      return;
    }

    const payload = {
      product: {
        name: trimmedName,
        retail_price: primaryPrice,
        retail_price_2: parseOptionalNumber(retailPrice2),
        retail_price_3: parseOptionalNumber(retailPrice3),
        wholesale_price: parseOptionalNumber(wholesalePrice),
        retail_commission: parseOptionalNumber(retailCommission),
        wholesale_commission: parseOptionalNumber(wholesaleCommission),
        weight: parseOptionalNumber(weight),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        thumbnail: thumbnail.trim() || undefined,
      },
    };

    setValidationError(null);

    try {
      await updateMutation.mutateAsync({
        productId,
        payload,
      });
      router.push("/dashboard/products");
    } catch {
      // Error feedback handled by mutation toast
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border border-[#f0f0f0] shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <CardHeader className="space-y-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Product
            </p>
            <h1 className="text-2xl font-semibold text-[#222]">
              {product.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Product #{product.id}
            </p>
          </div>
          {variantsPreview.length ? (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {variantsPreview.map((item) => (
                <Badge key={item.id} variant="outline">
                  {item.color ?? "Unspecified"}{" "}
                  {item.size ? `· ${item.size}` : ""}
                </Badge>
              ))}
              {itemsQuery.data &&
              itemsQuery.data.length > variantsPreview.length ? (
                <Badge variant="outline">
                  +{(itemsQuery.data?.length ?? 0) - variantsPreview.length}{" "}
                  more
                </Badge>
              ) : null}
            </div>
          ) : null}
        </CardHeader>
      </Card>

      <Card className="rounded-3xl border border-[#f0f0f0] shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                htmlFor={nameInputId}
              >
                Product name
              </label>
              <Input
                id={nameInputId}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Premium winter coat"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                htmlFor={categoryInputId}
              >
                Category
              </label>
              <Input
                id={categoryInputId}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Optional category"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                htmlFor={retailPriceInputId}
              >
                Retail price (1 unit)
              </label>
              <Input
                id={retailPriceInputId}
                value={retailPrice}
                onChange={(event) => setRetailPrice(event.target.value)}
                inputMode="decimal"
                placeholder="Required"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                htmlFor={retailPrice2InputId}
              >
                Retail price per unit (2 units)
              </label>
              <Input
                id={retailPrice2InputId}
                value={retailPrice2}
                onChange={(event) => setRetailPrice2(event.target.value)}
                inputMode="decimal"
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                htmlFor={retailPrice3InputId}
              >
                Retail price per unit (3 units)
              </label>
              <Input
                id={retailPrice3InputId}
                value={retailPrice3}
                onChange={(event) => setRetailPrice3(event.target.value)}
                inputMode="decimal"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                htmlFor={wholesalePriceInputId}
              >
                Wholesale price
              </label>
              <Input
                id={wholesalePriceInputId}
                value={wholesalePrice}
                onChange={(event) => setWholesalePrice(event.target.value)}
                inputMode="decimal"
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                htmlFor={retailCommissionInputId}
              >
                Retail commission
              </label>
              <Input
                id={retailCommissionInputId}
                value={retailCommission}
                onChange={(event) => setRetailCommission(event.target.value)}
                inputMode="decimal"
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                htmlFor={wholesaleCommissionInputId}
              >
                Wholesale commission
              </label>
              <Input
                id={wholesaleCommissionInputId}
                value={wholesaleCommission}
                onChange={(event) => setWholesaleCommission(event.target.value)}
                inputMode="decimal"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-1">
              <label
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                htmlFor={weightInputId}
              >
                Weight (grams)
              </label>
              <Input
                id={weightInputId}
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                inputMode="decimal"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              htmlFor={descriptionInputId}
            >
              Description
            </label>
            <Textarea
              id={descriptionInputId}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="Short description for internal reference."
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              htmlFor="thumbnail"
            >
              Product Thumbnail
            </label>
            <p className="text-xs text-muted-foreground">
              Upload or change the thumbnail image for this product
            </p>
            <UploadArea
              endpoint="productImage"
              alt="Product thumbnail preview"
              value={thumbnail}
              onChange={setThumbnail}
            />
          </div>

          {validationError ? (
            <p className="text-sm text-destructive">{validationError}</p>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button asChild variant="outline" disabled={isSaving}>
              <Link href="/dashboard/products">Cancel</Link>
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
