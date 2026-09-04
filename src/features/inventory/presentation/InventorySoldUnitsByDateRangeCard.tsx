"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useSoldUnitsByDateRange } from "../application";
import type { InventorySoldUnitsDateRange } from "../domain";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

export const InventorySoldUnitsByDateRangeCard = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedRange, setAppliedRange] = useState<InventorySoldUnitsDateRange>({
    fromDate: "",
    toDate: "",
  });

  const soldUnitsQuery = useSoldUnitsByDateRange(appliedRange);
  const hasRangeInput = Boolean(fromDate && toDate);
  const isInvalidRange = hasRangeInput && fromDate > toDate;
  const soldUnitsRows = useMemo(
    () =>
      (soldUnitsQuery.data ?? [])
        .slice()
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0)),
    [soldUnitsQuery.data]
  );
  const soldUnitsTotal = useMemo(
    () => soldUnitsRows.reduce((acc, row) => acc + (row.value ?? 0), 0),
    [soldUnitsRows]
  );

  const handleLoadSoldUnits = () => {
    if (!hasRangeInput || isInvalidRange) return;
    setAppliedRange({ fromDate, toDate });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Units Sold By Date Range</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="inventory-sold-units-from">From</Label>
            <Input
              id="inventory-sold-units-from"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inventory-sold-units-to">To</Label>
            <Input
              id="inventory-sold-units-to"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>
          <Button
            onClick={handleLoadSoldUnits}
            disabled={!hasRangeInput || isInvalidRange || soldUnitsQuery.isFetching}
          >
            {soldUnitsQuery.isFetching ? "Loading..." : "Get Sold Units"}
          </Button>
        </div>

        {isInvalidRange ? (
          <p className="mt-2 text-sm text-destructive">
            The "From" date must be earlier than or equal to the "To" date.
          </p>
        ) : null}

        {appliedRange.fromDate && appliedRange.toDate ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Units sold between {appliedRange.fromDate} and {appliedRange.toDate}
            </p>
            {soldUnitsQuery.isLoading ? (
              <p className="text-sm font-medium">Loading...</p>
            ) : soldUnitsRows.length === 0 ? (
              <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
                No sold units found for this range.
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Products In Response
                    </p>
                    <p className="text-xl font-semibold">
                      {formatNumber(soldUnitsRows.length)}
                    </p>
                  </div>
                  <div className="rounded-md border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Total Units Sold
                    </p>
                    <p className="text-xl font-semibold">
                      {formatNumber(soldUnitsTotal)}
                    </p>
                  </div>
                </div>
                <div className="max-h-64 overflow-auto rounded-md border bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Key</TableHead>
                        <TableHead className="text-right">Units Sold</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {soldUnitsRows.map((row) => (
                        <TableRow key={row.key}>
                          <TableCell className="font-mono text-xs sm:text-sm">
                            {row.key}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(row.value ?? 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
