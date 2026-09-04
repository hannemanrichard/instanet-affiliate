"use client";

import { useMemo } from "react";
import Image from "next/image";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils/utils";
import { useProductInventory } from "../application";
import type { InventoryWithItem } from "../domain";
import { BulkAdjustDialog } from "./BulkAdjustDialog";
import { InventoryOverviewCard } from "./InventoryOverviewCard";

interface InventoryProductAccordionProps {
  productId: number;
  productName: string;
  productThumbnail?: string;
}

type ColorGroup = {
  color: string;
  items: InventoryWithItem[];
  totalQuantity: number;
  colorHex?: string;
};

const normalizeColor = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const groupByColor = (items: InventoryWithItem[]): ColorGroup[] => {
  const grouped = items.reduce<Record<string, ColorGroup>>((acc, entry) => {
    const colorValue = normalizeColor(entry.item?.color);
    if (!colorValue) {
      return acc;
    }

    if (!acc[colorValue]) {
      acc[colorValue] = {
        color: colorValue,
        items: [],
        totalQuantity: 0,
        colorHex: entry.item?.colorHex ?? undefined,
      };
    }
    acc[colorValue].items.push(entry);
    acc[colorValue].totalQuantity += entry.inventory.quantity;
    if (!acc[colorValue].colorHex && entry.item?.colorHex) {
      acc[colorValue].colorHex = entry.item.colorHex;
    }
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => a.color.localeCompare(b.color));
};

export const InventoryProductAccordion = ({
  productId,
  productName,
  productThumbnail,
}: InventoryProductAccordionProps) => {
  const { data, isLoading } = useProductInventory(productId);

  const grouped = useMemo(() => groupByColor(data ?? []), [data]);

  const filteredData = useMemo(
    () =>
      (data ?? []).filter(
        (entry) => normalizeColor(entry.item?.color) !== undefined
      ),
    [data]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (!filteredData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {productThumbnail ? (
              <div className="relative h-12 w-12 overflow-hidden rounded-md">
                <Image
                  src={productThumbnail}
                  alt={productName}
                  fill
                  className="object-cover"
                  sizes="48px"
                  unoptimized
                />
              </div>
            ) : null}
            <span>{productName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No inventory records found for this product.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <InventoryOverviewCard productId={productId} productName={productName} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg">
            {productThumbnail ? (
              <div className="relative h-12 w-12 overflow-hidden rounded-md">
                <Image
                  src={productThumbnail}
                  alt={productName}
                  fill
                  className="object-cover"
                  sizes="48px"
                  unoptimized
                />
              </div>
            ) : null}
            <span>{productName}</span>
          </CardTitle>
          <BulkAdjustDialog
            productId={productId}
            productName={productName}
            items={filteredData}
          />
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-4">
            {grouped.map((group) => (
              <AccordionItem key={group.color} value={group.color}>
                <AccordionTrigger className="flex w-full items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {group.colorHex ? (
                        <span
                          className="h-4 w-4 rounded-full border"
                          style={{ backgroundColor: group.colorHex }}
                          aria-hidden="true"
                        />
                      ) : null}
                      <Badge className="capitalize">{group.color}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {group.items.length} size
                      {group.items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    Total: {group.totalQuantity}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Size</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.items
                        .slice()
                        .sort((a, b) =>
                          (a.item?.size ?? "").localeCompare(b.item?.size ?? "")
                        )
                        .map((entry) => (
                          <TableRow key={entry.inventory.id}>
                            <TableCell
                              className={cn(
                                "font-medium",
                                !entry.item?.size && "text-muted-foreground"
                              )}
                            >
                              {entry.item?.size ?? "—"}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {entry.inventory.quantity}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
