"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils/utils";
import { UploadArea } from "@/shared/components/ui/upload-area";
import { UploadAreaMultiple } from "@/shared/components/ui/upload-area-multiple";
import {
  useAdminProducts,
  useCreateProductPage,
  useProductItems,
} from "@/features/products/application";

const normalizeVariantColor = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const formSchema = z.object({
  productId: z.coerce.number().int().min(1, "Select a product"),
  promoPoint: z.coerce
    .number()
    .int()
    .min(1, "Promo point must be at least 1")
    .max(3, "Promo point cannot exceed 3"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(slugRegex, "Use lowercase letters, numbers, and hyphens"),
  headline: z.string().trim().min(1, "Headline is required"),
  subheadline: z.string().trim().optional(),
  description: z.string().trim().optional(),
  heroImageUrl: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^https?:\/\//i.test(val), "Provide a valid URL"),
  heroImageAlt: z.string().trim().optional(),
  videoUrl: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^https?:\/\//i.test(val), "Provide a valid URL"),
  isActive: z.boolean().default(true),
  isAffiliateFriendly: z.boolean().default(false),
  isFreeShipping: z.boolean().default(false),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
  seoKeywords: z.string().trim().optional(),
  itemIds: z.array(z.number()).min(1, "Select at least one variant"),
  gallery: z
    .array(z.string().trim().url("Provide a valid image URL"))
    .default([]),
  testimonials: z
    .array(z.string().trim().url("Provide a valid image URL"))
    .default([]),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  productId: 0,
  promoPoint: 1,
  slug: "",
  headline: "",
  subheadline: "",
  description: "",
  heroImageUrl: "",
  heroImageAlt: "",
  videoUrl: "",
  isActive: true,
  isAffiliateFriendly: false,
  isFreeShipping: false,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  itemIds: [],
  gallery: [],
  testimonials: [],
};

export const ProductPageCreateView = () => {
  const router = useRouter();
  const createPageMutation = useCreateProductPage();
  const productsQuery = useAdminProducts();
  const products = productsQuery.data ?? [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    watch,
    setValue,
    formState: { isSubmitting, isValid, isDirty },
    handleSubmit,
    reset,
  } = form;

  const selectedProductId = watch("productId");
  const slugValue = watch("slug");

  const { data: productItemsData, isLoading: itemsLoading } = useProductItems(
    selectedProductId > 0 ? selectedProductId : 0
  );

  const availableItems = useMemo(
    () =>
      (productItemsData ?? []).filter(
        (item) => normalizeVariantColor(item.color) !== undefined
      ),
    [productItemsData]
  );

  useEffect(() => {
    if (!selectedProductId) {
      setValue("itemIds", []);
    }
  }, [selectedProductId, setValue]);

  const handleGenerateSlug = useCallback(() => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;
    const generated = product.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setValue("slug", generated, { shouldValidate: true, shouldDirty: true });
    if (!slugValue) {
      setValue("headline", product.name, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [products, selectedProductId, setValue, slugValue]);

  const onSubmit = (values: FormValues) => {
    const keywords = values.seoKeywords
      ?.split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    const seoMetadataRaw = {
      title: values.seoTitle?.trim() || undefined,
      description: values.seoDescription?.trim() || undefined,
      keywords: keywords && keywords.length ? keywords : undefined,
    };

    const seoMetadata = Object.fromEntries(
      Object.entries(seoMetadataRaw).filter(
        ([, value]) =>
          value !== undefined &&
          (Array.isArray(value) ? value.length > 0 : true)
      )
    );

    const galleryUrls =
      values.gallery
        ?.map((url) => url.trim())
        .filter((url) => url.length > 0) ?? [];

    const testimonialUrls =
      values.testimonials
        ?.map((url) => url.trim())
        .filter((url) => url.length > 0) ?? [];

    const payload = {
      page: {
        product_id: values.productId,
        promo_point: values.promoPoint,
        slug: values.slug.trim(),
        headline: values.headline.trim(),
        subheadline: values.subheadline?.trim() || undefined,
        description: values.description?.trim() || undefined,
        hero_media: values.heroImageUrl
          ? [
            {
              url: values.heroImageUrl.trim(),
              alt_text: values.heroImageAlt?.trim() || undefined,
              position: 0,
              is_primary: true,
            },
          ]
          : [],
        seo_metadata: Object.keys(seoMetadata).length ? seoMetadata : undefined,
        is_active: values.isActive,
        is_affiliate_friendly: values.isAffiliateFriendly,
        is_freeshipping: values.isFreeShipping,
        video_url: values.videoUrl?.trim() || undefined,
      },
      itemIds: values.itemIds,
      gallery: galleryUrls,
      testimonials: testimonialUrls,
    };

    createPageMutation.mutate(payload, {
      onSuccess: () => {
        reset(defaultValues);
        router.push("/dashboard/product-pages");
      },
    });
  };

  const disableSubmit =
    isSubmitting || createPageMutation.isPending || !isValid || !isDirty;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create product page</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? field.value.toString() : ""}
                      disabled={productsQuery.isLoading}
                    >
                      <SelectTrigger aria-label="Select product">
                        <SelectValue placeholder="Choose product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem
                            key={product.id}
                            value={product.id.toString()}
                          >
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="promoPoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promotion point</FormLabel>
                    <FormDescription>
                      Controls how many bundle options appear on the storefront.
                    </FormDescription>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? field.value.toString() : "1"}
                    >
                      <FormControl>
                        <SelectTrigger aria-label="Select promotion point">
                          <SelectValue placeholder="Select promotion point" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">
                          1 option (single unit)
                        </SelectItem>
                        <SelectItem value="2">
                          2 options (1 or 2 units)
                        </SelectItem>
                        <SelectItem value="3">
                          3 options (1, 2, or 3 units)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is-active">Published</Label>
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="!mt-0 flex flex-row items-center justify-between gap-2">
                        <FormLabel className="sr-only">Publish page</FormLabel>
                        <FormControl>
                          <Switch
                            id="is-active"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Published pages are visible in the storefront.
                </p>
              </div>
              <FormField
                control={form.control}
                name="isAffiliateFriendly"
                render={({ field }) => (
                  <div className="flex items-center justify-between border-t pt-4 mt-2">
                    <div className="space-y-1 pe-3">
                      <Label htmlFor="is-affiliate-friendly">
                        Affiliate friendly
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Affiliates can sell this page and create orders from it.
                      </p>
                    </div>
                    <FormItem className="!mt-0 flex flex-row items-center justify-between gap-2">
                      <FormLabel className="sr-only">
                        Enable for affiliates
                      </FormLabel>
                      <FormControl>
                        <Switch
                          id="is-affiliate-friendly"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="isFreeShipping"
                render={({ field }) => (
                  <div className="flex items-center justify-between border-t pt-4 mt-2">
                    <Label htmlFor="is-free-shipping">Free shipping</Label>
                    <FormItem className="!mt-0 flex flex-row items-center justify-between gap-2">
                      <FormLabel className="sr-only">
                        Enable free shipping badge
                      </FormLabel>
                      <FormControl>
                        <Switch
                          id="is-free-shipping"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-2">
                      <FormLabel>Slug</FormLabel>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleGenerateSlug}
                        disabled={!selectedProductId}
                      >
                        Generate from product
                      </Button>
                    </div>
                    <FormControl>
                      <Input placeholder="cashmere-coat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="Primary hero headline" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subheadline"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Subheadline</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="Supporting messaging (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Page description</FormLabel>
                    <FormDescription>
                      Markdown supported. Share the customer-facing copy that
                      appears on the storefront.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Introduce the product, highlight benefits, and add Markdown formatting."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="gallery"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold leading-none">
                        Gallery
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Optional additional images displayed on the product
                        page.
                      </p>
                    </div>
                    <Badge variant="outline">
                      {(field.value ?? []).length} images
                    </Badge>
                  </div>
                  <FormControl>
                    <input
                      ref={field.ref}
                      type="hidden"
                      value={(field.value ?? []).join("|")}
                      onChange={() => undefined}
                    />
                  </FormControl>
                  <UploadAreaMultiple
                    endpoint="productLibrary"
                    alt="Product gallery image"
                    value={field.value ?? []}
                    onChange={(urls) => field.onChange(urls)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="testimonials"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold leading-none">
                        Testimonials (optional)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Upload customer testimonial images.
                      </p>
                    </div>
                    <Badge variant="outline">
                      {(field.value ?? []).length} images
                    </Badge>
                  </div>
                  <FormControl>
                    <input
                      ref={field.ref}
                      type="hidden"
                      value={(field.value ?? []).join("|")}
                      onChange={() => undefined}
                    />
                  </FormControl>
                  <UploadAreaMultiple
                    endpoint="productLibrary"
                    alt="Testimonial image"
                    value={field.value ?? []}
                    onChange={(urls) => field.onChange(urls)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="heroImageUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Hero image</FormLabel>
                    <FormDescription>
                      Upload the primary hero image for this landing page.
                    </FormDescription>
                    <FormControl>
                      <input
                        ref={field.ref}
                        type="hidden"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <UploadArea
                      endpoint="productImage"
                      alt="Hero image preview"
                      value={field.value ?? ""}
                      onChange={(url) => field.onChange(url)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroImageAlt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero image alt text</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe the hero image" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormDescription>
                      Upload a video file for the sticky video component on the product page.
                    </FormDescription>
                    <FormControl>
                      <input
                        ref={field.ref}
                        type="hidden"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <UploadArea
                      endpoint="productVideo"
                      alt="Video preview"
                      value={field.value ?? ""}
                      onChange={(url) => field.onChange(url)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seoTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Title for search engines"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seoDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="Meta description (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seoKeywords"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>SEO keywords</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="keyword one, keyword two"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Assign variants</h3>
                  <p className="text-sm text-muted-foreground">
                    Select product variants to showcase on this page.
                  </p>
                </div>
                <Badge variant="outline">
                  {form.watch("itemIds").length} selected
                </Badge>
              </div>
              <FormField
                control={form.control}
                name="itemIds"
                render={({ field }) => (
                  <FormItem>
                    <FormMessage />
                    <div className="rounded-md border">
                      {itemsLoading ? (
                        <Skeleton className="h-32 w-full rounded-md" />
                      ) : availableItems.length === 0 ? (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                          {selectedProductId
                            ? "No variants with colours found for this product."
                            : "Select a product to load variants."}
                        </div>
                      ) : (
                        <div className="divide-y">
                          {availableItems.map((item) => {
                            const checked =
                              field.value?.includes(item.id) ?? false;
                            return (
                              <label
                                key={item.id}
                                className={cn(
                                  "flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors",
                                  "hover:bg-muted/60"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(isChecked) => {
                                      if (isChecked) {
                                        field.onChange([
                                          ...(field.value ?? []),
                                          item.id,
                                        ]);
                                      } else {
                                        field.onChange(
                                          (field.value ?? []).filter(
                                            (id) => id !== item.id
                                          )
                                        );
                                      }
                                    }}
                                  />
                                  <div>
                                    <p className="font-medium">
                                      {item.color}
                                      {item.size ? ` · ${item.size}` : ""}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Inventory: {item.quantity ?? 0}
                                    </p>
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset(defaultValues);
                  router.push("/dashboard/product-pages");
                }}
                disabled={createPageMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={disableSubmit}>
                {createPageMutation.isPending ? "Creating..." : "Create page"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
