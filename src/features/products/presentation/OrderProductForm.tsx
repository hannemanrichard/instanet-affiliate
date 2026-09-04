"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useFormatter, useTranslations } from "next-intl";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { X } from "lucide-react";
import { Loader } from "@/shared/components/ui/loader";
import type { ProductItemEntity } from "../domain";
import { cn } from "@/shared/utils/utils";

const REORDER_POINT = 1;
const inputClassName =
  "h-12 rounded-xl border-[#d9d9d9] bg-white px-4 text-base placeholder:text-sm";

const SIZE_RANGES: Record<string, { height: string; weight: string }> = {
  S: { height: "1.50m - 1.63m", weight: "55kg - 65kg" },
  M: { height: "1.60m - 1.70m", weight: "65kg - 75kg" },
  L: { height: "1.65m - 1.73m", weight: "75kg - 85kg" },
  XL: { height: "1.68m - 1.76m", weight: "85kg - 95kg" },
  XXL: { height: "1.70m - 1.83m", weight: "95kg - 105kg" },
  "3XL": { height: "1.75m - 1.85m", weight: "105kg - 115kg" },
};

type TranslationFn = (
  key: string,
  values?: Record<string, string | number | Date>
) => string;

const createOrderProductSchema = (
  t: TranslationFn,
  showPromotionOptions: boolean = true
) =>
  z.object({
    fullName: z.string().min(2, { message: t("validation.fullName") }),
    phone: z
      .string()
      .min(6, { message: t("validation.phoneMin") })
      .max(20, { message: t("validation.phoneMax") }),
    commune: z.string().min(2, { message: t("validation.commune") }),
    wilaya: z.string().min(2, { message: t("validation.wilaya") }),
    variants: z
      .array(
        z.object({
          color: z.string().min(1, { message: t("validation.color") }),
          size: z.string().optional(),
        })
      )
      .min(1, { message: t("validation.variantCount", { count: 1 }) }),
    offer: z.string().optional(),
    promotionOption: showPromotionOptions
      ? z.string().min(1, { message: t("validation.bundle") })
      : z.string().optional(),
  });

export type OrderProductFormValues = z.infer<
  ReturnType<typeof createOrderProductSchema>
>;

interface OrderProductFormProps {
  variants: ProductItemEntity[];
  isSubmitting?: boolean;
  /** When true, the form is non-interactive (e.g. recent successful submission cooldown). */
  isSubmissionBlocked?: boolean;
  defaultValues?: Partial<OrderProductFormValues>;
  promotionOptions?: PromotionOption[];
  showPromotionOptions?: boolean;
  onSubmit: (values: OrderProductFormValues) => void;
}

type ColorOption = {
  color: string;
  colorHex?: string;
  sizes: Array<{
    value: string;
    quantity: number;
    disabled: boolean;
  }>;
  disabled: boolean;
};

export type PromotionOption = {
  id: string;
  units: number;
  unitPrice: number;
  totalPrice: number;
  label: string;
};

const buildColorOptions = (variants: ProductItemEntity[]): ColorOption[] => {
  const groups = variants.reduce<
    Record<
      string,
      {
        color: string;
        colorHex?: string;
        sizes: Map<
          string,
          {
            value: string;
            quantity: number;
          }
        >;
      }
    >
  >((acc, variant) => {
    const colorKey = variant.color ?? "Unspecified";
    const sizeKey = variant.size ?? "Standard";
    const quantity = variant.quantity ?? 0;

    if (!acc[colorKey]) {
      acc[colorKey] = {
        color: colorKey,
        colorHex: variant.colorHex ?? undefined,
        sizes: new Map(),
      };
    }

    const existingSize = acc[colorKey].sizes.get(sizeKey);
    if (!existingSize) {
      acc[colorKey].sizes.set(sizeKey, {
        value: sizeKey,
        quantity,
      });
    } else {
      existingSize.quantity = Math.max(existingSize.quantity, quantity);
      acc[colorKey].sizes.set(sizeKey, existingSize);
    }

    if (!acc[colorKey].colorHex && variant.colorHex) {
      acc[colorKey].colorHex = variant.colorHex;
    }

    return acc;
  }, {});

  return Object.values(groups).map((group) => {
    const sizes = Array.from(group.sizes.values())
      .sort((a, b) => a.value.localeCompare(b.value))
      .map((size) => ({
        value: size.value,
        quantity: size.quantity,
        disabled: (size.quantity ?? 0) < REORDER_POINT,
      }));

    const disabled = sizes.every((size) => size.disabled);

    return {
      color: group.color,
      colorHex: group.colorHex,
      sizes,
      disabled,
    };
  });
};

const countEnabledSizes = (option: ColorOption): number =>
  option.sizes.filter((size) => !size.disabled).length;

const sumEnabledInventory = (option: ColorOption): number =>
  option.sizes
    .filter((size) => !size.disabled)
    .reduce((sum, size) => sum + (size.quantity ?? 0), 0);

const compareColorOptions = (a: ColorOption, b: ColorOption): number => {
  const sizeVarietyDiff = countEnabledSizes(b) - countEnabledSizes(a);
  if (sizeVarietyDiff !== 0) return sizeVarietyDiff;

  const inventoryDiff = sumEnabledInventory(b) - sumEnabledInventory(a);
  if (inventoryDiff !== 0) return inventoryDiff;

  return a.color.localeCompare(b.color);
};

/** Prefer most in-stock sizes, then highest total inventory, then name. */
const sortColorsForDefault = (options: ColorOption[]): ColorOption[] =>
  [...options].sort(compareColorOptions);

type SizeOption = ColorOption["sizes"][number];

const pickDefaultSize = (sizes: SizeOption[]): string => {
  const enabled = sizes.filter((size) => !size.disabled);
  if (!enabled.length) return "";

  const best = [...enabled].sort((a, b) => {
    const quantityDiff = (b.quantity ?? 0) - (a.quantity ?? 0);
    if (quantityDiff !== 0) return quantityDiff;
    return a.value.localeCompare(b.value);
  })[0];

  return best?.value ?? "";
};

const buildInitialVariants = (
  units: number,
  defaults: OrderProductFormValues["variants"] | undefined,
  fallbackColor: string
): OrderProductFormValues["variants"] => {
  const safeUnits = units > 0 ? units : 1;
  const items: OrderProductFormValues["variants"] = [];

  for (let index = 0; index < safeUnits; index += 1) {
    items.push({
      color: defaults?.[index]?.color ?? fallbackColor,
      size: defaults?.[index]?.size ?? "",
    });
  }

  if (!items.length) {
    items.push({ color: fallbackColor, size: "" });
  }

  return items;
};

export const OrderProductForm = ({
  variants,
  isSubmitting,
  isSubmissionBlocked = false,
  defaultValues,
  promotionOptions = [],
  showPromotionOptions = true,
  onSubmit,
}: OrderProductFormProps) => {
  const t = useTranslations("storefront.orderForm");
  const tCurrency = useTranslations("storefront.search");
  const formatter = useFormatter();
  const formatCurrency = (value?: number | null) => {
    if (value == null) return "—";
    // Always use Western Arabic numerals (0-9) regardless of locale
    const formattedNumber = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
      numberingSystem: "latn",
    }).format(value);
    return `${formattedNumber} ${tCurrency("currencySymbol")}`;
  };

  const colorOptions = useMemo(() => buildColorOptions(variants), [variants]);
  const enabledColors = useMemo(() => {
    const enabled = colorOptions.filter((option) => !option.disabled);
    const pool = enabled.length > 0 ? enabled : colorOptions;
    return sortColorsForDefault(pool);
  }, [colorOptions]);
  const defaultColor = enabledColors[0]?.color ?? "";

  const availablePromotionOptions = useMemo(() => {
    if (promotionOptions.length) {
      return promotionOptions;
    }

    return [
      {
        id: "single",
        units: 1,
        unitPrice: 0,
        totalPrice: 0,
        label: t("bundleOption", { count: 1 }),
      },
    ];
  }, [promotionOptions, t]);

  const schema = useMemo(
    () =>
      createOrderProductSchema(t, showPromotionOptions).superRefine(
        (data, ctx) => {
          const selectedPromotion =
            availablePromotionOptions.find(
              (option) => option.id === data.promotionOption
            ) ?? availablePromotionOptions[0];
          const units = selectedPromotion?.units ?? 1;

          if (data.variants.length !== units) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t("validation.variantCount", { count: units }),
              path: ["variants"],
            });
          }

          data.variants.forEach((variant, index) => {
            const colorOption = colorOptions.find(
              (option) => option.color === variant.color
            );

            if (!variant.color || !colorOption || colorOption.disabled) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t("validation.color"),
                path: ["variants", index, "color"],
              });
              return;
            }

            const sizeOptions = colorOption?.sizes ?? [];
            const enabledSizes = sizeOptions.filter((size) => !size.disabled);

            if (
              sizeOptions.length > 0 &&
              (!variant.size ||
                !enabledSizes.some((size) => size.value === variant.size))
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t("validation.size"),
                path: ["variants", index, "size"],
              });
            }
          });
        }
      ),
    [availablePromotionOptions, colorOptions, t, showPromotionOptions]
  );

  const fallbackPromotionId = availablePromotionOptions[0]?.id ?? "";
  const initialPromotionId = showPromotionOptions
    ? (defaultValues?.promotionOption ?? (fallbackPromotionId || "single"))
    : fallbackPromotionId || "single";
  const initialPromotion =
    availablePromotionOptions.find(
      (option) => option.id === initialPromotionId
    ) ?? availablePromotionOptions[0];
  const initialUnits = initialPromotion?.units ?? 1;
  const fallbackColor = defaultColor;

  const form = useForm<OrderProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: defaultValues?.fullName ?? "",
      phone: defaultValues?.phone ?? "",
      commune: defaultValues?.commune ?? "",
      wilaya: defaultValues?.wilaya ?? "",
      variants: buildInitialVariants(
        initialUnits,
        defaultValues?.variants,
        fallbackColor
      ),
      offer: defaultValues?.offer ?? "",
      promotionOption: initialPromotionId,
    },
  });

  const variantsValue = form.watch("variants");
  const selectedPromotionId = form.watch("promotionOption");
  const selectedOffer = form.watch("offer");

  const selectedPromotion = useMemo(
    () =>
      availablePromotionOptions.find(
        (option) => option.id === selectedPromotionId
      ) ?? availablePromotionOptions[0],
    [availablePromotionOptions, selectedPromotionId]
  );

  const desiredVariantCount = selectedPromotion?.units ?? 1;
  const totalPriceDisplay = selectedPromotion
    ? formatCurrency(selectedPromotion.totalPrice)
    : formatCurrency(0);

  useEffect(() => {
    const current = form.getValues("promotionOption");
    const exists = availablePromotionOptions.some(
      (option) => option.id === current
    );

    if (!exists && availablePromotionOptions[0]) {
      form.setValue("promotionOption", availablePromotionOptions[0].id, {
        shouldDirty: Boolean(current),
        shouldTouch: Boolean(current),
        shouldValidate: true,
      });
    }
  }, [availablePromotionOptions, form]);

  useEffect(() => {
    const currentVariants = form.getValues("variants");

    if (!enabledColors.length) return;

    // If offer 2 or 3 is selected, auto-select colors and sizes for all units
    if (desiredVariantCount >= 2) {
      const nextVariants: OrderProductFormValues["variants"] = [];

      for (let index = 0; index < desiredVariantCount; index += 1) {
        // Auto-select color (cycle through available colors)
        const colorIndex = index % enabledColors.length;
        const selectedColor =
          enabledColors[colorIndex]?.color ?? enabledColors[0]?.color ?? "";

        // Auto-select size if available
        const colorOption = colorOptions.find(
          (option) => option.color === selectedColor
        );
        const selectedSize = pickDefaultSize(colorOption?.sizes ?? []);

        nextVariants.push({ color: selectedColor, size: selectedSize });
      }

      form.setValue("variants", nextVariants, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      return;
    }

    // For offer 1, just adjust the count if needed
    if (currentVariants.length === desiredVariantCount) {
      return;
    }

    const nextVariants = currentVariants.slice(0, desiredVariantCount);
    const fallback = defaultColor;

    if (currentVariants.length < desiredVariantCount) {
      for (
        let index = currentVariants.length;
        index < desiredVariantCount;
        index += 1
      ) {
        nextVariants.push({ color: fallback, size: "" });
      }
    }

    form.setValue("variants", nextVariants, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [desiredVariantCount, form, colorOptions, enabledColors, defaultColor]);

  useEffect(() => {
    if (!enabledColors.length) return;

    variantsValue.forEach((variant, index) => {
      if (!variant) return;
      const currentColor = variant.color;
      const isValid = enabledColors.some(
        (option) => option.color === currentColor
      );
      if (!isValid) {
        form.setValue(`variants.${index}.color`, defaultColor, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    });
  }, [colorOptions, form, variantsValue, enabledColors, defaultColor]);

  useEffect(() => {
    variantsValue.forEach((variant, index) => {
      if (!variant) return;

      const fieldName = `variants.${index}.size` as const;
      const sizeOptions =
        colorOptions.find((option) => option.color === variant.color)?.sizes ??
        [];
      const enabledSizes = sizeOptions.filter((size) => !size.disabled);

      if (sizeOptions.length === 0) {
        if (variant.size) {
          form.setValue(fieldName, "", {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }
        return;
      }

      // Auto-select size if not selected or invalid, especially for offer 2 or 3
      if (
        !variant.size ||
        !enabledSizes.some((size) => size.value === variant.size)
      ) {
        form.setValue(fieldName, pickDefaultSize(sizeOptions), {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    });
  }, [variantsValue, colorOptions, form]);

  const handleSubmit = (values: OrderProductFormValues) => {
    onSubmit(values);
  };

  const handlePromotionKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    onSelect: () => void
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <fieldset
          disabled={isSubmissionBlocked}
          className="m-0 min-w-0 space-y-6 border-0 p-0 disabled:pointer-events-none disabled:opacity-60"
        >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-[#222]">
                  {t("labels.fullName")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("placeholders.fullName")}
                    className={inputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-[#222]">
                  {t("labels.phone")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("placeholders.phone")}
                    className={inputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="commune"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-[#222]">
                  {t("labels.commune")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("placeholders.commune")}
                    className={inputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="wilaya"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-[#222]">
                  {t("labels.wilaya")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("placeholders.wilaya")}
                    className={inputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {showPromotionOptions && (
          <div>
            <FormField
              control={form.control}
              name="promotionOption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-[#222]">
                    {t("labels.bundle")}
                  </FormLabel>
                  {availablePromotionOptions.length > 1 ? (
                    <FormControl>
                      <div
                        role="radiogroup"
                        aria-label={t("bundleAria")}
                        className="flex w-full lg:flex-row flex-col gap-2"
                      >
                        {availablePromotionOptions.map((option) => {
                          const isSelected = field.value === option.id;
                          const onSelect = () => {
                            form.setValue("promotionOption", option.id, {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            });
                          };

                          return (
                            <div
                              key={option.id}
                              role="radio"
                              aria-checked={isSelected}
                              tabIndex={0}
                              aria-label={`${t("bundleAria")}: ${option.label}`}
                              onClick={onSelect}
                              onKeyDown={(event) =>
                                handlePromotionKeyDown(event, onSelect)
                              }
                              className={cn(
                                "flex cursor-pointer flex-col gap-2 rounded-2xl border px-5 py-3 text-base font-semibold uppercase outline-none transition",
                                isSelected
                                  ? "border-black border-[3px] text-black shadow-[0_18px_40px_rgba(34,34,34,0.22)]"
                                  : "border-[#dedede] text-[#333] hover:border-black focus-visible:ring-2 focus-visible:ring-black/60"
                              )}
                            >
                              <span>{option.label}</span>
                              <span className="text-sm font-normal text-muted-foreground">
                                {t("bundleSummary", {
                                  units: option.units,
                                  price: formatCurrency(option.unitPrice),
                                })}
                              </span>
                              <span className="text-sm font-semibold text-[#222]">
                                {t("bundleTotal", {
                                  price: formatCurrency(option.totalPrice),
                                })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </FormControl>
                  ) : (
                    <div className="rounded-2xl border border-[#f1f1f1] bg-[#fafafa] px-5 py-4 text-base">
                      <p className="font-semibold text-[#222]">
                        {t("singleBundleSummary", {
                          label: availablePromotionOptions[0]?.label ?? "",
                          price: formatCurrency(
                            availablePromotionOptions[0]?.unitPrice ?? 0
                          ),
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("bundleTotal", {
                          price: formatCurrency(
                            availablePromotionOptions[0]?.totalPrice ?? 0
                          ),
                        })}
                      </p>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="space-y-3">
          {Array.from({ length: desiredVariantCount }).map((_, index) => {
            const variant = variantsValue[index];
            const colorFieldName = `variants.${index}.color` as const;
            const sizeFieldName = `variants.${index}.size` as const;
            const sizeOptions =
              colorOptions.find((option) => option.color === variant?.color)
                ?.sizes ?? [];

            return (
              <div
                key={`variant-${index}`}
                className="space-y-3 rounded-xl border border-[#e2e2e2] bg-[#fafafa] p-4 shadow-sm"
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("unitsLabel", { index: index + 1 })}
                </p>
                <FormField
                  control={form.control}
                  name={colorFieldName}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-[#222]">
                        {t("labels.color")}
                      </FormLabel>
                      <FormControl>
                        <div
                          role="radiogroup"
                          aria-label={t("labels.color")}
                          className="flex flex-wrap gap-1.5"
                        >
                          {colorOptions.map((option) => {
                            const isSelected = field.value === option.color;
                            const isDisabled = option.disabled;
                            const onSelect = () => {
                              if (isDisabled) return;
                              form.setValue(colorFieldName, option.color, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              });
                            };
                            const onKeyDown = (
                              event: KeyboardEvent<HTMLDivElement>
                            ) => handlePromotionKeyDown(event, onSelect);

                            return (
                              <div key={option.color} className="relative">
                                <div
                                  role="radio"
                                  aria-checked={isSelected}
                                  tabIndex={0}
                                  aria-disabled={isDisabled}
                                  aria-label={`${t("labels.color", {
                                    index: index + 1,
                                  })}: ${option.color}`}
                                  onClick={onSelect}
                                  onKeyDown={onKeyDown}
                                  className={cn(
                                    "relative flex cursor-pointer items-center gap-2 rounded-xl border-2 p-1 text-base uppercase outline-none transition",
                                    isSelected && !isDisabled
                                      ? "border-slate-700 text-[#222] shadow-[0_16px_36px_rgba(34,34,34,0.15)]"
                                      : "border-[#e5e5e5] text-[#333] hover:border-black focus-visible:ring-2 focus-visible:ring-black/60",
                                    isDisabled &&
                                      "pointer-events-none opacity-40"
                                  )}
                                >
                                  {option.colorHex ? (
                                    <span
                                      className="h-8 w-8 rounded-xl border border-border"
                                      style={{
                                        backgroundColor: option.colorHex,
                                      }}
                                      aria-hidden="true"
                                    />
                                  ) : null}
                                </div>
                                {isDisabled && (
                                  <X className="absolute inset-0 m-auto h-full w-full text-red-500 stroke-[1] opacity-80 z-10" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={sizeFieldName}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-[#222]">
                        {t("labels.size")}
                      </FormLabel>
                      <FormControl>
                        {sizeOptions.length > 0 ? (
                          <div
                            role="radiogroup"
                            aria-label={t("labels.size")}
                            className="flex flex-wrap gap-1.5"
                          >
                            {sizeOptions.map((sizeOption) => {
                              const isSelected =
                                field.value === sizeOption.value;
                              const isDisabled = sizeOption.disabled;
                              const onSelect = () => {
                                if (isDisabled) return;
                                form.setValue(sizeFieldName, sizeOption.value, {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true,
                                });
                              };
                              const onKeyDown = (
                                event: KeyboardEvent<HTMLDivElement>
                              ) => handlePromotionKeyDown(event, onSelect);

                              return (
                                <div
                                  key={sizeOption.value}
                                  className="relative"
                                >
                                  <div
                                    role="radio"
                                    aria-checked={isSelected}
                                    tabIndex={0}
                                    aria-disabled={isDisabled}
                                    aria-label={`${t("labels.size", {
                                      index: index + 1,
                                    })}: ${sizeOption.value}`}
                                    onClick={onSelect}
                                    onKeyDown={onKeyDown}
                                    className={cn(
                                      "relative flex cursor-pointer items-center justify-center rounded-2xl border-[3px] px-4 py-2 text-base uppercase outline-none transition",
                                      isSelected && !isDisabled
                                        ? "border-black text-[#222] shadow-[0_12px_32px_rgba(34,34,34,0.15)]"
                                        : "border-[#e5e5e5] text-[#333] hover:border-black focus-visible:ring-2 focus-visible:ring-black/60",
                                      isDisabled &&
                                        "pointer-events-none opacity-60"
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        isDisabled &&
                                          "line-through decoration-red-500 decoration-2"
                                      )}
                                    >
                                      {sizeOption.value}
                                    </span>
                                  </div>
                                  {isDisabled && (
                                    <X className="absolute inset-0 m-auto h-full w-full text-red-500 stroke-[1] opacity-70 z-10" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="rounded-2xl border border-dashed border-muted-foreground/40 bg-white px-4 py-2 text-base text-muted-foreground">
                            {t("sizesNotRequired")}
                          </p>
                        )}
                      </FormControl>
                      {field.value &&
                        SIZE_RANGES[field.value.toUpperCase()] && (
                          <div className="mt-3 flex items-center gap-4 rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm text-blue-900">
                            <div className="flex items-center gap-1">
                              <span className="font-medium opacity-70">
                                {t("labels.weight")}:
                              </span>
                              <span className="font-semibold">
                                {SIZE_RANGES[field.value.toUpperCase()].weight}
                              </span>
                            </div>
                          </div>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-[#f1f1f1] bg-[#fafafa] p-6 text-base">
          <div className="flex items-end justify-between">
            <span className="text-lg font-semibold text-[#222]">
              {t("orderTotal")}
            </span>
            <span className="text-3xl font-semibold text-red-500">
              {totalPriceDisplay}
            </span>
          </div>
          {selectedPromotion ? (
            <p className="text-sm text-muted-foreground">
              {t("bundleSummary", {
                units: selectedPromotion.units,
                price: formatCurrency(selectedPromotion.unitPrice),
              })}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("promotionMissing")}
            </p>
          )}
          {selectedOffer ? (
            <Badge
              variant="outline"
              className="w-fit rounded-full px-3 py-1 text-sm"
            >
              {t("offerLabel", { offer: selectedOffer })}
            </Badge>
          ) : null}
        </div>

        <Button
          id="order-now-submit-button"
          type="submit"
          className="h-14 w-full rounded-2xl bg-black text-lg font-semibold text-white hover:bg-black/90 focus-visible:ring-black"
          size="lg"
          disabled={isSubmitting || isSubmissionBlocked}
        >
          {isSubmitting ? (
            <>
              <Loader className="me-2" size={0.5} />
              {t("submitting")}
            </>
          ) : (
            t("submit")
          )}
        </Button>
        </fieldset>
      </form>
    </Form>
  );
};
