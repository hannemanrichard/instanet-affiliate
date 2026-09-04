"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { useFormatter, useTranslations } from "next-intl";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Loader } from "@/shared/components/ui/loader";
import { useToast } from "@/shared/hooks/use-toast";
import { useProductItems, useProductPage } from "../application";
import { NewProductGallery } from "./NewProductGallery";
import { TestimonialsCarousel } from "./TestimonialsCarousel";
import {
  OrderProductForm,
  type OrderProductFormValues,
  type PromotionOption,
} from "./OrderProductForm";
import dynamic from "next/dynamic";
import { MarkdownRenderer } from "@/shared/components/MarkdownRenderer";
import { trackPurchase } from "@/shared/utils/pixelTracking";

// Lazy load StickyVideo component for better performance
const StickyVideo = dynamic(
  () =>
    import("./StickyVideo").then((mod) => ({
      default: mod.StickyVideo,
    })),
  {
    ssr: false,
    loading: () => null,
  }
);
import { useCreatePublicLead } from "@/features/leads/application";
import {
  detectTrafficSource,
  getChannelFromSource,
} from "@/shared/utils/trafficSource";
import {
  getLeadSubmissionCooldownRemainingMs,
  isLeadSubmissionBlocked,
  recordLeadSubmission,
} from "../utils/storefrontLeadSubmissionCooldown";
import { useStorefrontLeadSubmissionCooldown } from "./useStorefrontLeadSubmissionCooldown";

interface ProductPageViewProps {
  slug: string;
}

interface ProductHeaderProps {
  headline: string;
  subheadline?: string | null;
  primaryPromotion?: PromotionOption;
  isFreeShipping?: boolean;
  freeShippingLabel: string;
  formatCurrency: (value: number) => string;
}

const ProductHeader = ({
  headline,
  subheadline,
  primaryPromotion,
  isFreeShipping,
  freeShippingLabel,
  formatCurrency,
}: ProductHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold leading-tight text-[#111] sm:text-4xl">
          {headline}
        </h1>
        {subheadline && (
          <p className="text-sm text-muted-foreground sm:text-base">
            {subheadline}
          </p>
        )}
      </div>
      {primaryPromotion && (
        <div className="space-y-2">
          <div className="text-3xl font-bold text-red-500 sm:text-4xl">
            {formatCurrency(primaryPromotion.unitPrice)}
          </div>
          {isFreeShipping ? (
            <span className="inline-flex items-center gap-1 self-start rounded-full border border-red-500 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-600 shadow-sm sm:text-sm">
              <span>{freeShippingLabel}</span>
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};

interface ProductInfoSectionProps {
  description?: string;
}

const ProductInfoSection = ({ description }: ProductInfoSectionProps) => {
  if (!description) return null;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-[#222]">Description</h2>
      <div className="prose prose-sm max-w-none text-[#333]">
        <MarkdownRenderer content={description} />
      </div>
    </div>
  );
};

import { Alert, AlertDescription } from "@/shared/components/ui/alert";

interface LeadFormSectionProps {
  variants: ReturnType<typeof useProductItems>["data"];
  promotionOptions: PromotionOption[];
  onSubmit: (values: OrderProductFormValues) => void;
  isSubmitting?: boolean;
  isSubmissionBlocked?: boolean;
  submissionCooldownMinutes?: number;
}

const LeadFormSection = ({
  variants,
  promotionOptions,
  onSubmit,
  isSubmitting,
  isSubmissionBlocked = false,
  submissionCooldownMinutes = 0,
}: LeadFormSectionProps) => {
  const t = useTranslations("storefront.product.leadForm");

  return (
    <section
      id="lead-form-section"
      className="rounded-3xl bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8"
    >
      <div className="mb-6 space-y-2">
        <h2 className="text-2xl font-semibold text-[#222]">{t("headline")}</h2>
        <p className="text-sm text-muted-foreground">{t("subheadline")}</p>
      </div>
      {isSubmissionBlocked ? (
        <Alert
          className="mb-6 border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-50"
          role="status"
          aria-live="polite"
        >
          <AlertDescription className="text-sm font-medium">
            {t("orderInProgress", { minutes: submissionCooldownMinutes })}
          </AlertDescription>
        </Alert>
      ) : null}
      <OrderProductForm
        variants={variants ?? []}
        promotionOptions={promotionOptions}
        showPromotionOptions={promotionOptions.length > 1}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        isSubmissionBlocked={isSubmissionBlocked}
      />
    </section>
  );
};

export const ProductPageView = ({ slug }: ProductPageViewProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const tProduct = useTranslations("storefront.product");
  const tLeadForm = useTranslations("storefront.product.leadForm");
  const tOrderForm = useTranslations("storefront.orderForm");
  const tCurrency = useTranslations("storefront.search");

  const pageQuery = useProductPage(slug);
  const page = pageQuery.data;
  const isLoading = pageQuery.isLoading;

  const itemsQuery = useProductItems(page?.page.product_id ?? 0);
  const variants = itemsQuery.data ?? [];

  const createLeadMutation = useCreatePublicLead();

  const { isBlocked: isLeadSubmissionCooldownActive, minutesRemaining, refresh } =
    useStorefrontLeadSubmissionCooldown(slug);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLeadFormVisible, setIsLeadFormVisible] = useState(false);

  const trafficSource = useMemo(() => {
    return detectTrafficSource(searchParams);
  }, [searchParams]);

  const galleryImages = useMemo(() => {
    if (!page) return [];
    const images: string[] = [];

    // Add gallery images from page.images
    if (page.images && Array.isArray(page.images)) {
      const galleryUrls = page.images
        .map((img) => img.url)
        .filter((url): url is string => Boolean(url));
      images.push(...galleryUrls);
    }

    return images;
  }, [page]);

  const [selectedTestimonialIndex, setSelectedTestimonialIndex] = useState(0);

  const testimonialImages = useMemo(() => {
    if (!page || !page.testimonials) return [];
    return page.testimonials
      .map((testimonial) => testimonial.url)
      .filter((url): url is string => Boolean(url));
  }, [page]);

  const promotionOptions = useMemo<PromotionOption[]>(() => {
    if (!page) return [];

    const options: PromotionOption[] = [];
    const promoPoint = Math.max(1, page.page.promo_point ?? 1);

    const createOption = (units: number, price: number | null | undefined) => {
      if (price == null) return;
      options.push({
        id: `${units}`,
        units,
        unitPrice: price,
        totalPrice: price * units,
        label: tOrderForm("bundleOption", { count: units }),
      });
    };

    createOption(1, page.product.retail_price);
    if (promoPoint >= 2) {
      createOption(2, page.product.retail_price_2);
    }
    if (promoPoint >= 3) {
      createOption(3, page.product.retail_price_3);
    }

    if (!options.length) {
      options.push({
        id: "1",
        units: 1,
        unitPrice: page.product.retail_price ?? 0,
        totalPrice: (page.product.retail_price ?? 0) * 1,
        label: tOrderForm("bundleOption", { count: 1 }),
      });
    }

    return options;
  }, [page, tOrderForm]);

  const primaryPromotion = promotionOptions[0];

  useEffect(() => {
    const formVisible = searchParams.get("form") === "visible";
    setIsLeadFormVisible(formVisible);
  }, [searchParams]);

  const handleStickyButtonClick = () => {
    const formElement = document.getElementById("order-now-submit-button");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
      formElement.focus();
    } else {
      router.push(`?form=visible`, { scroll: false });
      setIsLeadFormVisible(true);
    }
  };

  /**
   * Get the objective based on the channel
   * @param channel - The channel string (tiktok, meta, or storefront)
   * @returns The objective string
   */
  const getObjectiveFromChannel = (channel: string): string => {
    if (channel === "tiktok") {
      return "tiktok-conversion";
    }
    if (channel === "meta") {
      return "meta-conversion";
    }
    return "conversion";
  };

  const handleSubmit = (values: OrderProductFormValues) => {
    if (isLeadSubmissionBlocked(slug)) {
      const remainingMs = getLeadSubmissionCooldownRemainingMs(slug);
      const minutes = Math.max(1, Math.ceil(remainingMs / 60_000));
      toast({
        title: tLeadForm("orderInProgressTitle"),
        description: tLeadForm("orderInProgress", { minutes }),
      });
      refresh();
      return;
    }

    // Find the selected promotion option
    const selectedPromotion = promotionOptions.find(
      (option) => option.id === values.promotionOption
    );

    if (!selectedPromotion || !page) {
      return;
    }

    // Map selected variants to item_ids
    // When multiple units are selected, distribute them across variants
    // If one variant is selected with 2 units, create one item with qty: 2
    // If multiple variants are selected, distribute units evenly
    const totalUnits = selectedPromotion.units;
    const variantCount = values.variants.length;
    const unitsPerVariant = Math.floor(totalUnits / variantCount);
    const remainder = totalUnits % variantCount;

    // First, map variants to items with quantities
    const itemsMap = new Map<number, number>();

    values.variants.forEach((selectedVariant, index) => {
      // Find matching variant by color and size
      const matchingVariant = variants.find(
        (variant) =>
          variant.color === selectedVariant.color &&
          (selectedVariant.size
            ? variant.size === selectedVariant.size
            : !variant.size || variant.size === "")
      );

      if (!matchingVariant || !matchingVariant.id) {
        return;
      }

      // Distribute units: first items get one extra unit if there's a remainder
      const qty = unitsPerVariant + (index < remainder ? 1 : 0);
      const itemId = matchingVariant.id;

      // Consolidate items with the same item_id by summing quantities
      const currentQty = itemsMap.get(itemId) || 0;
      itemsMap.set(itemId, currentQty + Math.max(1, qty));
    });

    // Convert map to array
    const leadItems = Array.from(itemsMap.entries()).map(([item_id, qty]) => ({
      item_id,
      qty,
    }));

    // Validate that we have items and total quantity matches
    if (leadItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one variant.",
        variant: "destructive",
      });
      return;
    }

    const totalQty = leadItems.reduce((sum, item) => sum + item.qty, 0);
    if (totalQty !== totalUnits) {
      toast({
        title: "Error",
        description: "Failed to distribute units correctly. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Extract full name parts
    const nameParts = values.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Extract product, color, and size from selected variants
    const colors = values.variants.map((v) => v.color).filter(Boolean);
    const sizes = values.variants
      .map((v) => v.size)
      .filter((size): size is string => Boolean(size));

    // Combine multiple values with comma if needed
    const color = colors.length > 0 ? colors.join(", ") : undefined;
    const size = sizes.length > 0 ? sizes.join(", ") : undefined;

    // Format retail prices in format: "1-{price1}, 2-{price2 * 2}, 3-{price3 * 3}"
    const priceParts: string[] = [];
    const price1 =
      typeof page.product.retail_price === "number"
        ? page.product.retail_price
        : null;
    const price2 =
      typeof page.product.retail_price_2 === "number"
        ? page.product.retail_price_2
        : null;
    const price3 =
      typeof page.product.retail_price_3 === "number"
        ? page.product.retail_price_3
        : null;

    if (price1 != null) {
      priceParts.push(`1-${price1}`);
    }
    if (price2 != null) {
      const totalPrice2 = price2 * 2;
      priceParts.push(`2-${totalPrice2}`);
    }
    if (price3 != null) {
      const totalPrice3 = price3 * 3;
      priceParts.push(`3-${totalPrice3}`);
    }
    const retailPrices = priceParts.join(", ") || "";

    // Get channel from detected traffic source
    const channel = getChannelFromSource(trafficSource);
    // Get objective based on channel
    const objective = getObjectiveFromChannel(channel);

    // Create lead with lead_items
    // agent_id / hop handled by POST /api/leads/public
    const partnerRef = searchParams.get("ref")?.trim() || undefined;
    createLeadMutation.mutate(
      {
        lead: {
          first_name: firstName,
          last_name: lastName,
          phone: values.phone,
          status: "initial",
          objective: objective,
          commune: values.commune,
          wilaya: values.wilaya,
          product: page.product.name,
          color: color,
          size: size,
          is_moved: false,
          is_abondoned: false,
          is_wholesale: false,
          offer: values.offer || selectedPromotion.label,
          channel: channel,
          price: retailPrices,
        },
        items: leadItems,
        ...(partnerRef ? { ref: partnerRef } : {}),
      },
      {
        onSuccess: () => {
          recordLeadSubmission(slug);
          refresh();

          // Track purchase event for Facebook and TikTok pixels + Meta Conversion API
          // (lead_hop is created server-side by POST /api/leads/public when agent is assigned)
          trackPurchase({
            value: selectedPromotion.totalPrice,
            currency: "DZD",
            content_name: page.product.name,
            content_ids: [page.product.id.toString()],
            num_items: selectedPromotion.units,
            userData: {
              ph: values.phone ? [values.phone] : undefined,
              fn: firstName ? [firstName] : undefined,
              ln: lastName ? [lastName] : undefined,
            },
          });

          toast({
            title: tProduct("toast.title"),
            description: tProduct("toast.description"),
          });
          router.push("/thank-you");
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to submit order. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64 rounded-full" />
        <Skeleton className="h-[480px] w-full rounded-3xl" />
        <Skeleton className="h-[360px] w-full rounded-3xl" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
        <p className="text-sm text-muted-foreground">{tProduct("notFound")}</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    // Always use Western Arabic numerals (0-9) regardless of locale
    const formattedNumber = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
      numberingSystem: "latn",
    }).format(value);
    return `${formattedNumber}${tCurrency("currencySymbol")}`;
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="mx-auto max-w-[1200px] pt-2 lg:px-8">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[55%_45%] lg:grid-rows-[auto_auto]">
          <div className="order-1 lg:order-none lg:row-span-1 lg:col-span-1">
            <NewProductGallery
              headline={page.page.headline}
              images={galleryImages}
              selectedIndex={selectedImageIndex}
              onSelect={setSelectedImageIndex}
            />
            <div className="mt-4">
              <ProductHeader
                headline={page.page.headline}
                subheadline={page.page.subheadline}
                primaryPromotion={primaryPromotion}
                isFreeShipping={page.page.is_freeshipping}
                freeShippingLabel={tProduct("freeShipping")}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>
          <div className="order-2 lg:order-none lg:col-span-1 lg:row-span-2">
            <LeadFormSection
              variants={variants}
              promotionOptions={promotionOptions}
              onSubmit={handleSubmit}
              isSubmitting={createLeadMutation.isPending}
              isSubmissionBlocked={isLeadSubmissionCooldownActive}
              submissionCooldownMinutes={minutesRemaining}
            />
          </div>
          <div className="order-3 lg:order-none lg:col-span-1 lg:row-start-2">
            <ProductInfoSection
              description={page.page.description ?? undefined}
            />
          </div>
        </div>
      </div>

      {/* Testimonials Carousel */}
      {testimonialImages.length > 0 && (
        <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
          <TestimonialsCarousel
            images={testimonialImages}
            headline="Customer Reviews"
            selectedIndex={selectedTestimonialIndex}
            onSelect={setSelectedTestimonialIndex}
          />
        </div>
      )}

      {/* Sticky Order Now Button */}
      {page && !isLeadFormVisible && (
        <div className="fixed bottom-6 left-0 right-0 z-50 px-4 transition-opacity duration-300 lg:left-auto lg:right-auto lg:max-w-7xl lg:px-6">
          <Button
            onClick={handleStickyButtonClick}
            className="h-14 w-full rounded-2xl bg-black text-base font-semibold text-white shadow-lg hover:bg-black/90 focus-visible:ring-black"
            size="lg"
            disabled={
              createLeadMutation.isPending || isLeadSubmissionCooldownActive
            }
          >
            {createLeadMutation.isPending ? (
              <>
                <Loader className="me-2" size={0.5} />
                {tOrderForm("submitting")}
              </>
            ) : (
              tOrderForm("submit")
            )}
          </Button>
        </div>
      )}

      {/* Sticky Video */}
      {page.page.video_url && <StickyVideo videoSrc={page.page.video_url} />}
    </div>
  );
};
