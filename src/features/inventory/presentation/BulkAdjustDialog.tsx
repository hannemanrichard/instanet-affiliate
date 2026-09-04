"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useToast } from "@/shared/hooks/use-toast";
import { useBulkAdjustInventory } from "../application";
import type { InventoryWithItem } from "../domain";

interface BulkAdjustDialogProps {
  productId: number;
  productName: string;
  items: InventoryWithItem[];
  triggerLabel?: string;
}

type AdjustmentRow = {
  itemId: number;
  color: string;
  size?: string;
  currentQuantity: number;
  newQuantity: number;
};

const normalizeDisplayValue = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const createRowsFromItems = (items: InventoryWithItem[]): AdjustmentRow[] =>
  items
    .reduce<AdjustmentRow[]>((acc, entry) => {
      const color = normalizeDisplayValue(entry.item?.color);
      if (!color) {
        return acc;
      }

      acc.push({
        itemId: entry.inventory.item_id,
        color,
        size: normalizeDisplayValue(entry.item?.size),
        currentQuantity: entry.inventory.quantity,
        newQuantity: entry.inventory.quantity,
      });

      return acc;
    }, [])
    .sort((a, b) => {
      const colorComparison = a.color.localeCompare(b.color);
      if (colorComparison !== 0) {
        return colorComparison;
      }

      return (a.size ?? "").localeCompare(b.size ?? "");
    });

const formatDisplayValue = (value?: string) =>
  value && value.trim().length ? value : "Unspecified";

export const BulkAdjustDialog = ({
  productId,
  items,
  productName,
  triggerLabel = "Adjust Inventory",
}: BulkAdjustDialogProps) => {
  const { toast } = useToast();
  const mutation = useBulkAdjustInventory();
  const [open, setOpen] = useState(false);
  const baseRows = useMemo(() => createRowsFromItems(items), [items]);
  const [rows, setRows] = useState<AdjustmentRow[]>(baseRows);

  useEffect(() => {
    if (open) {
      setRows(baseRows);
    }
  }, [baseRows, open]);

  useEffect(() => {
    if (!open) {
      setRows(baseRows);
    }
  }, [baseRows, open]);

  const hasChanges = useMemo(
    () =>
      rows.some(
        (row, index) => row.newQuantity !== baseRows[index]?.currentQuantity
      ),
    [rows, baseRows]
  );

  const handleQuantityChange = (itemId: number, value: string) => {
    const quantity = Number.isNaN(Number(value)) ? 0 : Number(value);
    setRows((current) =>
      current.map((row) =>
        row.itemId === itemId
          ? {
              ...row,
              newQuantity: Math.max(0, Math.min(quantity, 9999)),
            }
          : row
      )
    );
  };

  const handleSubmit = () => {
    mutation.mutate(
      {
        productId,
        adjustments: rows.map((row) => ({
          itemId: row.itemId,
          quantity: row.newQuantity,
        })),
      },
      {
        onSuccess: () => {
          toast({
            title: "Inventory updated",
            description: `Quantities for ${productName} were updated successfully.`,
          });
          setOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Update failed",
            description:
              error instanceof Error && error.message.trim().length
                ? error.message
                : "We could not update the inventory. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Adjust Inventory</DialogTitle>
          <DialogDescription>
            Update the quantities for each size variant of {productName}.
          </DialogDescription>
        </DialogHeader>
        {rows.length ? (
          <ScrollArea className="max-h-[400px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Color</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">New Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.itemId}>
                    <TableCell>{formatDisplayValue(row.color)}</TableCell>
                    <TableCell>{formatDisplayValue(row.size)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {row.currentQuantity}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        className="w-24 text-right"
                        type="number"
                        min={0}
                        max={9999}
                        value={row.newQuantity}
                        onChange={(event) =>
                          handleQuantityChange(row.itemId, event.target.value)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
            No variants with specified colors are available for adjustment.
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasChanges || mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
