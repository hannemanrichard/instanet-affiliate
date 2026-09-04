"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { AppIcon } from "@/shared/components/layout/AppIcon";
import { uiIcons } from "@/shared/components/layout/navIcons";
import { cn } from "@/shared/utils/utils";

interface BulkAction<T> {
  label: string;
  action: (items: T[]) => void;
}

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKey?: string;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCreateClick?: () => void;
  createButtonLabel?: string;
  onRowsSelect?: (rows: T[]) => void;
  bulkActions?: BulkAction<T>[];
  isSelectable?: boolean;
  emptyLabel?: string;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showToolbar?: boolean;
  showColumnToggle?: boolean;
  showPageSizeSelector?: boolean;
  embedded?: boolean;
}

export const getTablePageCount = (totalItems: number, pageSize: number) => {
  const size = Math.max(1, pageSize);
  const total = Math.max(0, totalItems);
  return Math.max(1, Math.ceil(total / size));
};

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  searchQuery: externalSearchQuery,
  onSearchChange,
  onCreateClick,
  createButtonLabel = "Create",
  onRowsSelect,
  bulkActions,
  isSelectable = false,
  emptyLabel = "No results.",
  totalItems = 0,
  currentPage = 1,
  pageSize = 25,
  onPageChange,
  onPageSizeChange,
  showToolbar = true,
  showColumnToggle = true,
  showPageSizeSelector = true,
  embedded = false,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<{
    key: string;
    asc: boolean;
  } | null>(null);
  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<string, boolean>
  >({});
  const [internalSearchQuery, setInternalSearchQuery] = React.useState("");

  const searchQuery =
    externalSearchQuery !== undefined
      ? externalSearchQuery
      : internalSearchQuery;
  const setSearchQuery = onSearchChange || setInternalSearchQuery;
  const [internalPageIndex, setInternalPageIndex] = React.useState(0);
  const [internalPageSize, setInternalPageSize] = React.useState(pageSize);

  const pageIndex = onPageChange ? currentPage - 1 : internalPageIndex;
  const effectivePageSize = onPageSizeChange ? pageSize : internalPageSize;
  const [selectedRows, setSelectedRows] = React.useState<
    Record<number, boolean>
  >({});

  const filteredData = React.useMemo(() => {
    let processed = [...data];

    if (searchKey && searchQuery && externalSearchQuery === undefined) {
      processed = processed.filter((item) =>
        String(item[searchKey])
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    if (sorting) {
      processed.sort((a, b) => {
        const modifier = sorting.asc ? 1 : -1;
        return a[sorting.key] > b[sorting.key] ? modifier : -modifier;
      });
    }

    return processed;
  }, [data, searchKey, searchQuery, sorting, externalSearchQuery]);

  const totalCount = onPageChange ? totalItems : filteredData.length;
  const pageCount = getTablePageCount(totalCount, effectivePageSize);

  const paginatedData = onPageChange
    ? filteredData
    : filteredData.slice(
        pageIndex * effectivePageSize,
        (pageIndex + 1) * effectivePageSize
      );

  const handleSelectAll = React.useCallback(
    (checked: boolean) => {
      const newSelected = {} as Record<number, boolean>;
      paginatedData.forEach((_, index) => {
        newSelected[index] = checked;
      });
      setSelectedRows(newSelected);

      if (onRowsSelect) {
        onRowsSelect(checked ? paginatedData : []);
      }
    },
    [paginatedData, onRowsSelect]
  );

  const handleSelectRow = React.useCallback(
    (index: number, checked: boolean) => {
      setSelectedRows((prev) => ({ ...prev, [index]: checked }));

      if (onRowsSelect) {
        const selectedItems = paginatedData.filter((_, idx) =>
          idx === index ? checked : selectedRows[idx]
        );
        onRowsSelect(selectedItems);
      }
    },
    [paginatedData, selectedRows, onRowsSelect]
  );

  const selectedItems = React.useMemo(
    () => paginatedData.filter((_, idx) => selectedRows[idx]),
    [paginatedData, selectedRows]
  );

  const hasSelectedItems = selectedItems.length > 0;
  const visibleColumns = columns.filter(
    (column) => !columnVisibility[column.key]
  );
  const allSelected =
    paginatedData.length > 0 &&
    paginatedData.every((_, index) => selectedRows[index]);

  const handleSortClick = (columnKey: string) => {
    setSorting((prev) =>
      prev?.key === columnKey
        ? { key: columnKey, asc: !prev.asc }
        : { key: columnKey, asc: true }
    );
  };

  const handleFirstPage = () => {
    if (onPageChange) {
      onPageChange(1);
      return;
    }
    setInternalPageIndex(0);
  };

  const handlePreviousPage = () => {
    if (onPageChange) {
      onPageChange(currentPage - 1);
      return;
    }
    setInternalPageIndex(pageIndex - 1);
  };

  const handleNextPage = () => {
    if (onPageChange) {
      onPageChange(currentPage + 1);
      return;
    }
    setInternalPageIndex(pageIndex + 1);
  };

  const handleLastPage = () => {
    if (onPageChange) {
      onPageChange(pageCount);
      return;
    }
    setInternalPageIndex(pageCount - 1);
  };

  return (
    <div className={cn("min-w-0 w-full", embedded ? "space-y-0" : "space-y-4")}>
      {showToolbar ? (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {searchKey ? (
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="max-w-sm"
              aria-label={searchPlaceholder}
            />
          ) : null}
          {hasSelectedItems && bulkActions ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions
                  <AppIcon icon={uiIcons.chevronDown} size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>
                  {selectedItems.length} items selected
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {bulkActions.map((action) => (
                  <DropdownMenuItem
                    key={action.label}
                    onClick={() => action.action(selectedItems)}
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {showColumnToggle ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <AppIcon icon={uiIcons.columns} size={16} />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  className="capitalize"
                  checked={!columnVisibility[column.key]}
                  onCheckedChange={(value) =>
                    setColumnVisibility((prev) => ({
                      ...prev,
                      [column.key]: !value,
                    }))
                  }
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          ) : null}
          {onCreateClick ? (
            <Button size="sm" onClick={onCreateClick}>
              {createButtonLabel}
            </Button>
          ) : null}
        </div>
      </div>
      ) : null}

      <div
        className={cn(
          "min-w-0 overflow-x-auto bg-card shadow-none",
          embedded
            ? "rounded-none border-y border-border"
            : "rounded-xl border border-border"
        )}
      >
        <Table className="min-w-[40rem]">
          <TableHeader>
            <TableRow>
              {isSelectable ? (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              ) : null}
              {visibleColumns.map((column) => (
                <TableHead key={column.key}>
                  {column.sortable ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="-ms-3 h-8 px-3 text-xs font-medium text-secondary-foreground hover:text-foreground"
                      onClick={() => handleSortClick(column.key)}
                      aria-label={`Sort by ${column.label}`}
                    >
                      {column.label}
                      <AppIcon icon={uiIcons.chevronsUpDown} size={14} />
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={visibleColumns.length + (isSelectable ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={index}
                  data-state={selectedRows[index] ? "selected" : undefined}
                >
                  {isSelectable ? (
                    <TableCell className="w-12">
                      <Checkbox
                        checked={selectedRows[index] || false}
                        onCheckedChange={(checked) =>
                          handleSelectRow(index, Boolean(checked))
                        }
                        aria-label={`Select row ${index + 1}`}
                      />
                    </TableCell>
                  ) : null}
                  {visibleColumns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render
                        ? column.render(row)
                        : (row[column.key] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <p className="min-w-0 text-xs font-medium tabular-nums text-muted-foreground">
          {hasSelectedItems
            ? `${selectedItems.length} of ${paginatedData.length} row(s) selected`
            : `Page ${pageCount === 0 ? 0 : pageIndex + 1} of ${pageCount}`}
        </p>
        <div className="flex items-center gap-2">
          {showPageSizeSelector ? (
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${effectivePageSize}`}
              onValueChange={(value) => {
                const newSize = Number(value);
                if (onPageSizeChange) {
                  onPageSizeChange(newSize);
                  return;
                }
                setInternalPageSize(newSize);
                setInternalPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]" aria-label="Rows per page">
                <SelectValue placeholder={effectivePageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          ) : null}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden size-8 rounded-lg border-border text-muted-foreground hover:text-foreground lg:inline-flex"
              onClick={handleFirstPage}
              disabled={pageIndex === 0}
              aria-label="Go to first page"
            >
              <AppIcon
                icon={uiIcons.chevronsLeft}
                size={14}
                className="rtl:rotate-180"
              />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-border text-muted-foreground hover:text-foreground"
              onClick={handlePreviousPage}
              disabled={pageIndex === 0}
              aria-label="Go to previous page"
            >
              <AppIcon
                icon={uiIcons.chevronLeft}
                size={14}
                className="rtl:rotate-180"
              />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-border text-muted-foreground hover:text-foreground"
              onClick={handleNextPage}
              disabled={pageIndex >= pageCount - 1}
              aria-label="Go to next page"
            >
              <AppIcon
                icon={uiIcons.chevronRight}
                size={14}
                className="rtl:rotate-180"
              />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden size-8 rounded-lg border-border text-muted-foreground hover:text-foreground lg:inline-flex"
              onClick={handleLastPage}
              disabled={pageIndex >= pageCount - 1}
              aria-label="Go to last page"
            >
              <AppIcon
                icon={uiIcons.chevronsRight}
                size={14}
                className="rtl:rotate-180"
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
