"use client";

import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  useProductInventory,
  useProductInventoryPhaseDetails,
} from "../application";
import type {
  InventoryPhase,
  InventoryPhaseColorDetail,
  InventoryPhaseVariantDetail,
  InventoryWithItem,
} from "../domain";

interface InventoryOverviewCardProps {
  productId: number;
  productName: string;
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

type ColorGroup = {
  color: string;
  colorHex?: string;
  total: number;
  variants: Array<{
    id: string;
    size?: string;
    quantity: number;
  }>;
};

const groupByColor = (items: InventoryWithItem[]): ColorGroup[] => {
  const grouped = items.reduce<Record<string, ColorGroup>>((acc, entry) => {
    const colorValue = entry.item?.color?.trim() ?? "";
    const colorKey =
      colorValue.length === 0 || colorValue.toLowerCase() === "unspecified"
        ? null
        : colorValue;

    if (!colorKey) {
      return acc;
    }

    if (!acc[colorKey]) {
      acc[colorKey] = {
        color: colorKey,
        colorHex: entry.item?.colorHex ?? undefined,
        total: 0,
        variants: [],
      };
    }

    acc[colorKey].variants.push({
      id: entry.inventory.id.toString(),
      size: entry.item?.size ?? undefined,
      quantity: entry.inventory.quantity,
    });

    acc[colorKey].total += entry.inventory.quantity ?? 0;

    if (!acc[colorKey].colorHex && entry.item?.colorHex) {
      acc[colorKey].colorHex = entry.item.colorHex;
    }

    return acc;
  }, {});

  return Object.values(grouped)
    .map((group) => ({
      ...group,
      variants: group.variants.sort(
        (
          a: ColorGroup["variants"][number],
          b: ColorGroup["variants"][number]
        ) => (a.size ?? "").localeCompare(b.size ?? "")
      ),
    }))
    .sort((a, b) => a.color.localeCompare(b.color));
};

const mapPhaseDetailToColorGroup = (
  details: InventoryPhaseColorDetail[]
): ColorGroup[] =>
  details
    .map((detail) => ({
      color: detail.color,
      colorHex: detail.colorHex,
      total: detail.total,
      variants: detail.variants
        .map((variant: InventoryPhaseVariantDetail) => ({
          id: variant.itemId,
          size: variant.size,
          quantity: variant.quantity,
        }))
        .sort(
          (
            a: ColorGroup["variants"][number],
            b: ColorGroup["variants"][number]
          ) => (a.size ?? "").localeCompare(b.size ?? "")
        ),
    }))
    .sort((a, b) => a.color.localeCompare(b.color));

const isUnspecifiedColor = (color?: string) => {
  if (!color) return true;
  const normalized = color.trim().toLowerCase();
  return normalized.length === 0 || normalized === "unspecified";
};

export const InventoryOverviewCard = ({
  productId,
  productName,
}: InventoryOverviewCardProps) => {
  const { data: variantData, isLoading: variantsLoading } =
    useProductInventory(productId);
  const grouped = useMemo(() => groupByColor(variantData ?? []), [variantData]);
  const orderedFilter = useMemo(
    () => ({
      phases: ["ordered"] as InventoryPhase[],
      productName,
    }),
    [productName]
  );
  const deliveredFilter = useMemo(
    () => ({
      phases: ["delivered"] as InventoryPhase[],
      productName,
    }),
    [productName]
  );
  const inDeliveryFilter = useMemo(
    () => ({
      phases: ["in_delivery"] as InventoryPhase[],
      productName,
    }),
    [productName]
  );
  const { data: orderedDetails = [], isLoading: orderedLoading } =
    useProductInventoryPhaseDetails(productId, orderedFilter);
  const orderedGroups = useMemo(
    () => mapPhaseDetailToColorGroup(orderedDetails),
    [orderedDetails]
  );
  const { data: deliveredDetails = [], isLoading: deliveredLoading } =
    useProductInventoryPhaseDetails(productId, deliveredFilter);
  const deliveredGroups = useMemo(
    () => mapPhaseDetailToColorGroup(deliveredDetails),
    [deliveredDetails]
  );
  const { data: inDeliveryDetails = [], isLoading: inDeliveryLoading } =
    useProductInventoryPhaseDetails(productId, inDeliveryFilter);
  const inDeliveryGroups = useMemo(
    () => mapPhaseDetailToColorGroup(inDeliveryDetails),
    [inDeliveryDetails]
  );
  const displayGrouped = useMemo(
    () => grouped.filter((group) => !isUnspecifiedColor(group.color)),
    [grouped]
  );
  const displayOrderedGroups = useMemo(
    () => orderedGroups.filter((group) => !isUnspecifiedColor(group.color)),
    [orderedGroups]
  );
  const displayInDeliveryGroups = useMemo(
    () => inDeliveryGroups.filter((group) => !isUnspecifiedColor(group.color)),
    [inDeliveryGroups]
  );
  const displayDeliveredGroups = useMemo(
    () => deliveredGroups.filter((group) => !isUnspecifiedColor(group.color)),
    [deliveredGroups]
  );

  if (
    variantsLoading ||
    !variantData ||
    orderedLoading ||
    deliveredLoading ||
    inDeliveryLoading
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{productName}</span>
            <Badge variant="secondary">Loading</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
          <Skeleton className="h-48 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const inStockTotal = grouped.reduce((acc, group) => acc + group.total, 0);
  const orderedTotal = orderedGroups.reduce(
    (acc, group) => acc + group.total,
    0
  );
  const inDeliveryTotal = inDeliveryGroups.reduce(
    (acc, group) => acc + group.total,
    0
  );
  const deliveredTotal = deliveredGroups.reduce(
    (acc, group) => acc + group.total,
    0
  );
  const totalInventory =
    inStockTotal + orderedTotal + inDeliveryTotal + deliveredTotal;
  type CardType = "total" | "stock" | "ordered" | "delivery" | "delivered";
  const cards = [
    {
      key: "total",
      label: "Total Inventory",
      value: totalInventory,
      badge: "default" as const,
      type: "total" as CardType,
    },
    {
      key: "stock",
      label: "In Stock",
      value: inStockTotal,
      badge: "secondary" as const,
      type: "stock" as CardType,
    },
    {
      key: "ordered",
      label: "Ordered",
      value: orderedTotal,
      badge: "secondary" as const,
      type: "ordered" as CardType,
    },
    {
      key: "delivery",
      label: "In Delivery",
      value: inDeliveryTotal,
      badge: "secondary" as const,
      type: "delivery" as CardType,
    },
    {
      key: "delivered",
      label: "Delivered",
      value: deliveredTotal,
      badge: "outline" as const,
      type: "delivered" as CardType,
    },
  ];

  const detailGroupsByType: Record<CardType, ColorGroup[]> = {
    total: displayGrouped,
    stock: displayGrouped,
    ordered: displayOrderedGroups,
    delivery: displayInDeliveryGroups,
    delivered: displayDeliveredGroups,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{productName}</span>
          <Badge variant="secondary">Inventory Snapshot</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {cards.map((card) => (
            <div key={card.key} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>{card.label}</span>
                <Badge variant={card.badge}>
                  {card.type === "stock"
                    ? "Available"
                    : card.type === "total"
                      ? "Total"
                      : "Pending"}
                </Badge>
              </div>
              <div className="text-2xl font-semibold">
                {formatNumber(card.value)}
              </div>
              <div className="mt-4">
                {card.type === "total" ||
                card.type === "stock" ||
                card.type === "ordered" ||
                card.type === "delivered" ||
                card.type === "delivery" ? (
                  detailGroupsByType[card.type].length ? (
                    <Accordion type="single" collapsible className="space-y-2">
                      {detailGroupsByType[card.type].map((group) => (
                        <AccordionItem
                          key={`${card.key}-${group.color}`}
                          value={group.color}
                        >
                          <AccordionTrigger>
                            <div className="flex w-full items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                {group.colorHex ? (
                                  <span
                                    className="h-4 w-4 rounded-full border"
                                    style={{ backgroundColor: group.colorHex }}
                                    aria-hidden="true"
                                  />
                                ) : null}
                                <span className="text-sm font-medium capitalize">
                                  {group.color}
                                </span>
                              </div>
                              <Badge variant="outline">
                                {group.total} units
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Size</TableHead>
                                  <TableHead className="text-right">
                                    Quantity
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {group.variants.map((variant) => (
                                  <TableRow key={`${card.key}-${variant.id}`}>
                                    <TableCell>{variant.size ?? "—"}</TableCell>
                                    <TableCell className="text-right font-mono">
                                      {variant.quantity ?? 0}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="rounded-lg border bg-muted/20 py-6 text-center text-sm text-muted-foreground">
                      No variants currently in this phase.
                    </div>
                  )
                ) : (
                  <Accordion type="single" collapsible>
                    <AccordionItem value={`${card.key}-placeholder`}>
                      <AccordionTrigger>Phase breakdown</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        Detailed color breakdown is currently available for
                        total and in-stock quantities only.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
