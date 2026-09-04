"use client";

import { useEffect, useId, useMemo, type KeyboardEvent } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Quantity } from "@/shared/components/ui/quantity";
import { cn } from "@/shared/utils/utils";
import { useProductItems } from "@/features/products";
import { SelectProductGrid } from "@/features/products/presentation/SelectProductGrid";
import type {
  ProductItemEntity,
  ProductPageEntity,
} from "@/features/products/domain";
import {
  colorSwatchClass,
  fieldLabelClass,
  itemCardClass,
  sizePillClass,
} from "./createOrderFormStyles";

export type OrderLineDraft = {
  key: string;
  productPageId: number | null;
  productId: number | null;
  color: string;
  size: string;
  qty: number;
  itemId: number | null;
};

type CreateOrderItemsFieldProps = {
  productPages: ProductPageEntity[];
  lines: OrderLineDraft[];
  onChange: (lines: OrderLineDraft[]) => void;
  hideSectionLabel?: boolean;
  lockedProductPageId?: number;
  lockedProductId?: number;
};

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

const REORDER_POINT = 1;

const createEmptyLine = (
  productPageId: number | null = null,
  productId: number | null = null
): OrderLineDraft => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  productPageId,
  productId,
  color: "",
  size: "",
  qty: 1,
  itemId: null,
});

export const createInitialOrderLines = (
  productPageId?: number,
  productId?: number
): OrderLineDraft[] => [
  createEmptyLine(productPageId ?? null, productId ?? null),
];

const buildColorOptions = (variants: ProductItemEntity[]): ColorOption[] => {
  const groups = variants.reduce<
    Record<
      string,
      {
        color: string;
        colorHex?: string;
        sizes: Map<string, { value: string; quantity: number }>;
      }
    >
  >((acc, variant) => {
    const colorKey = variant.color ?? "Unspecified";
    const sizeKey = variant.size?.trim() ? variant.size : "Standard";
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
      acc[colorKey].sizes.set(sizeKey, { value: sizeKey, quantity });
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

    return {
      color: group.color,
      colorHex: group.colorHex,
      sizes,
      disabled: sizes.every((size) => size.disabled),
    };
  });
};

const pickDefaultSize = (sizes: ColorOption["sizes"]): string => {
  const enabled = sizes.filter((size) => !size.disabled);
  if (!enabled.length) return "";
  const best = [...enabled].sort((a, b) => {
    const quantityDiff = (b.quantity ?? 0) - (a.quantity ?? 0);
    if (quantityDiff !== 0) return quantityDiff;
    return a.value.localeCompare(b.value);
  })[0];
  return best?.value ?? "";
};

const findMatchingVariant = (
  variants: ProductItemEntity[],
  color: string,
  size: string
): ProductItemEntity | null => {
  if (!color) return null;

  return (
    variants.find((item) => {
      const itemColor = item.color ?? "Unspecified";
      if (itemColor !== color) return false;

      const itemSize = item.size?.trim() ? item.size : "Standard";
      if (!size) return !item.size?.trim();
      return itemSize === size;
    }) ?? null
  );
};

const handleOptionKeyDown = (
  event: KeyboardEvent<HTMLDivElement>,
  onSelect: () => void
) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelect();
  }
};

const OrderLineRow = ({
  line,
  index,
  productPages,
  canDelete,
  hideProductPageField,
  onChange,
  onDelete,
}: {
  line: OrderLineDraft;
  index: number;
  productPages: ProductPageEntity[];
  canDelete: boolean;
  hideProductPageField: boolean;
  onChange: (next: OrderLineDraft) => void;
  onDelete: () => void;
}) => {
  const t = useTranslations("affiliateDashboard.orders.create");
  const baseId = useId();
  const selectedPage = productPages.find((page) => page.id === line.productPageId);
  const productId = line.productId ?? selectedPage?.product_id ?? 0;
  const itemsQuery = useProductItems(productId);
  const variants = itemsQuery.data ?? [];

  const colorOptions = useMemo(() => buildColorOptions(variants), [variants]);

  const selectedColorOption = useMemo(
    () => colorOptions.find((option) => option.color === line.color),
    [colorOptions, line.color]
  );

  const sizeOptions = selectedColorOption?.sizes ?? [];
  const showSizeChooser = Boolean(line.color) && sizeOptions.length > 0;
  const selectedSizeStock = sizeOptions.find(
    (size) => size.value === line.size
  )?.quantity;
  const quantityMax =
    selectedSizeStock != null && selectedSizeStock > 0
      ? selectedSizeStock
      : undefined;

  useEffect(() => {
    if (!line.productPageId || !line.color) {
      if (line.itemId != null) {
        onChange({ ...line, itemId: null });
      }
      return;
    }

    let nextSize = line.size;
    if (showSizeChooser) {
      const enabledSizes = sizeOptions.filter((size) => !size.disabled);
      const sizeValid = enabledSizes.some((size) => size.value === line.size);
      if (!sizeValid) {
        nextSize = pickDefaultSize(sizeOptions);
      }
    } else if (line.size) {
      nextSize = "";
    }

    const match = findMatchingVariant(variants, line.color, nextSize);
    const nextItemId = match?.id ?? null;

    if (nextSize !== line.size || nextItemId !== line.itemId) {
      onChange({ ...line, size: nextSize, itemId: nextItemId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    variants,
    line.productPageId,
    line.color,
    line.size,
    line.itemId,
    line.key,
    showSizeChooser,
    sizeOptions,
  ]);

  const handleProductPageSelect = (page: ProductPageEntity) => {
    onChange({
      ...line,
      productPageId: page.id,
      productId: page.product_id,
      color: "",
      size: "",
      itemId: null,
    });
  };

  const handleColorSelect = (color: string, disabled: boolean) => {
    if (disabled) return;
    const colorOption = colorOptions.find((option) => option.color === color);
    const nextSize = pickDefaultSize(colorOption?.sizes ?? []);
    onChange({
      ...line,
      color,
      size: nextSize,
      itemId: null,
    });
  };

  const handleSizeSelect = (size: string, disabled: boolean) => {
    if (disabled) return;
    onChange({
      ...line,
      size,
    });
  };

  return (
    <div className={itemCardClass}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("itemLabel", { index: index + 1 })}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          disabled={!canDelete}
          aria-label={t("deleteItemAria", { index: index + 1 })}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      {hideProductPageField ? null : (
        <div className="space-y-1.5">
          <Label className={fieldLabelClass}>{t("product")}</Label>
          <SelectProductGrid
            selectedPageId={line.productPageId}
            onSelect={handleProductPageSelect}
          />
        </div>
      )}

      {line.productPageId || line.productId ? (
        <>
          <div className="space-y-1.5">
            <Label className={fieldLabelClass}>{t("color")}</Label>
            <div
              role="radiogroup"
              aria-label={t("colorAria")}
              className="flex flex-wrap gap-1.5"
            >
              {colorOptions.map((option) => {
                const isSelected = line.color === option.color;
                const isDisabled = option.disabled;

                return (
                  <div key={option.color} className="relative">
                    <div
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      aria-disabled={isDisabled}
                      aria-label={`${t("color")}: ${option.color}`}
                      onClick={() =>
                        handleColorSelect(option.color, isDisabled)
                      }
                      onKeyDown={(event) =>
                        handleOptionKeyDown(event, () =>
                          handleColorSelect(option.color, isDisabled)
                        )
                      }
                      className={colorSwatchClass(isSelected, isDisabled)}
                    >
                      {option.colorHex ? (
                        <span
                          className="h-8 w-8 rounded-xl border border-[#d9d9d9]"
                          style={{ backgroundColor: option.colorHex }}
                          aria-hidden="true"
                        />
                      ) : (
                        <span className="px-2 text-xs font-semibold">
                          {option.color}
                        </span>
                      )}
                    </div>
                    {isDisabled ? (
                      <X
                        className="pointer-events-none absolute inset-0 z-10 m-auto h-full w-full text-red-500 opacity-80"
                        strokeWidth={1}
                        aria-hidden
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
            {!itemsQuery.isLoading && colorOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noColors")}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className={fieldLabelClass}>{t("size")}</Label>
            {showSizeChooser ? (
              <div
                role="radiogroup"
                aria-label={t("sizeAria")}
                className="flex flex-wrap gap-1.5"
              >
                {sizeOptions.map((sizeOption) => {
                  const isSelected = line.size === sizeOption.value;
                  const isDisabled = sizeOption.disabled;

                  return (
                    <div key={sizeOption.value} className="relative">
                      <div
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        aria-disabled={isDisabled}
                        aria-label={`${t("size")}: ${sizeOption.value}`}
                        onClick={() =>
                          handleSizeSelect(sizeOption.value, isDisabled)
                        }
                        onKeyDown={(event) =>
                          handleOptionKeyDown(event, () =>
                            handleSizeSelect(sizeOption.value, isDisabled)
                          )
                        }
                        className={sizePillClass(isSelected, isDisabled)}
                      >
                        <span
                          className={cn(
                            isDisabled &&
                              "line-through decoration-2 decoration-red-500"
                          )}
                        >
                          {sizeOption.value}
                        </span>
                      </div>
                      {isDisabled ? (
                        <X
                          className="pointer-events-none absolute inset-0 z-10 m-auto h-full w-full text-red-500 opacity-70"
                          strokeWidth={1}
                          aria-hidden
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-[#d9d9d9] bg-white px-4 py-2.5 text-sm text-muted-foreground">
                {line.color ? t("sizesNotRequired") : t("selectColorFirst")}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${baseId}-qty`} className={fieldLabelClass}>
              {t("quantity")}
            </Label>
            <Quantity
              id={`${baseId}-qty`}
              value={line.qty}
              min={1}
              max={quantityMax}
              onChange={(qty) => onChange({ ...line, qty })}
              aria-label={t("quantityAria")}
              decreaseAriaLabel={t("quantityDecreaseAria")}
              increaseAriaLabel={t("quantityIncreaseAria")}
            />
          </div>
        </>
      ) : null}
    </div>
  );
};

export const CreateOrderItemsField = ({
  productPages,
  lines,
  onChange,
  hideSectionLabel = false,
  lockedProductPageId,
  lockedProductId,
}: CreateOrderItemsFieldProps) => {
  const t = useTranslations("affiliateDashboard.orders.create");
  const isProductPageLocked =
    lockedProductPageId != null &&
    Number.isFinite(lockedProductPageId) &&
    lockedProductPageId > 0;

  const handleAddItem = () => {
    onChange([
      ...lines,
      createEmptyLine(
        isProductPageLocked ? lockedProductPageId : null,
        isProductPageLocked ? (lockedProductId ?? null) : null
      ),
    ]);
  };

  const handleLineChange = (index: number, next: OrderLineDraft) => {
    if (!isProductPageLocked) {
      onChange(lines.map((line, i) => (i === index ? next : line)));
      return;
    }

    onChange(
      lines.map((line, i) =>
        i === index
          ? {
              ...next,
              productPageId: lockedProductPageId,
              productId: lockedProductId ?? next.productId,
            }
          : line
      )
    );
  };

  const handleDeleteLine = (index: number) => {
    if (lines.length <= 1) return;
    onChange(lines.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex items-center gap-2",
          hideSectionLabel ? "justify-end" : "justify-between"
        )}
      >
        {!hideSectionLabel ? (
          <Label className={fieldLabelClass}>{t("items")}</Label>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          aria-label={t("addItemAria")}
          className="rounded-xl border-[#d9d9d9]"
        >
          <Plus className="mr-1 h-4 w-4" aria-hidden />
          {t("addItem")}
        </Button>
      </div>

      <div className="space-y-3">
        {lines.map((line, index) => (
          <OrderLineRow
            key={line.key}
            line={line}
            index={index}
            productPages={productPages}
            canDelete={lines.length > 1}
            hideProductPageField={isProductPageLocked}
            onChange={(next) => handleLineChange(index, next)}
            onDelete={() => handleDeleteLine(index)}
          />
        ))}
      </div>
    </div>
  );
};

export const isOrderLineComplete = (line: OrderLineDraft) => {
  return (
    line.productPageId != null &&
    Boolean(line.color) &&
    line.itemId != null &&
    Number.isFinite(line.qty) &&
    line.qty >= 1
  );
};
