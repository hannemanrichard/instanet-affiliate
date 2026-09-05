"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { useLocale } from "next-intl";
import { Search, X } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { DataTable } from "@/shared/components/ui/data-table/data-table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useStandardQuery } from "@/shared/hooks/useReactQuery";
import { apiFetch } from "@/shared/utils/apiFetch";
import { formatRelativeDate } from "@/shared/utils/formatRelativeDate";
import { cn } from "@/shared/utils/utils";
import type { PartnerEntity } from "@/features/partners/domain";

const getPartnerInitials = (partner: PartnerEntity) => {
  const label =
    partner.fullname?.trim() || partner.username?.trim() || String(partner.id);

  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const formatPaymentMethods = (partner: PartnerEntity) => {
  const methods = [];
  if (partner.baridimob_rib?.trim()) methods.push("BaridiMob");
  if (partner.redotpay_account?.trim()) methods.push("RedotPay");
  if (partner.usdt_address?.trim()) methods.push("USDT");
  return methods.length > 0 ? methods.join(", ") : "—";
};

export const AffiliatesManagementView = () => {
  const locale = useLocale();
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const affiliatesQuery = useStandardQuery(
    ["dashboard", "affiliates", appliedSearch || "all"],
    () =>
      apiFetch<{ affiliates: PartnerEntity[] }>(
        `/api/dashboard/affiliates${
          appliedSearch
            ? `?search=${encodeURIComponent(appliedSearch)}`
            : ""
        }`
      ).then((data) => data.affiliates),
    {
      staleTime: 60 * 1000,
    }
  );

  const handleApplySearch = () => {
    setAppliedSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setAppliedSearch("");
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleApplySearch();
  };

  const columns = useMemo(
    () => [
      {
        key: "affiliate",
        label: "Affiliate",
        render: (partner: PartnerEntity) => (
          <div className="flex min-w-0 items-center gap-3">
            {partner.avatar?.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={partner.avatar}
                alt=""
                className="size-9 shrink-0 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-1 ring-border">
                {getPartnerInitials(partner)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium">
                {partner.fullname?.trim() || partner.username?.trim() || "—"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {partner.email?.trim() || "No email"}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "username",
        label: "Username",
        render: (partner: PartnerEntity) => partner.username?.trim() || "—",
      },
      {
        key: "status",
        label: "Status",
        render: (partner: PartnerEntity) => {
          const isActive = partner.status === "active";

          return (
            <Badge variant={isActive ? "secondary" : "outline"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
        key: "payment",
        label: "Payment",
        render: (partner: PartnerEntity) => formatPaymentMethods(partner),
      },
      {
        key: "created_at",
        label: "Joined",
        render: (partner: PartnerEntity) => (
          <span className="text-muted-foreground">
            {formatRelativeDate(partner.created_at, locale)}
          </span>
        ),
      },
    ],
    [locale]
  );

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="space-y-0 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground sm:start-3"
                strokeWidth={1.75}
                aria-hidden
              />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search affiliates..."
                className={cn(
                  "h-11 border-0 bg-transparent pe-11 ps-11 shadow-none",
                  "placeholder:text-muted-foreground/70",
                  "focus-visible:ring-0",
                  "sm:h-9 sm:border sm:border-input sm:bg-background sm:pe-9 sm:ps-9 sm:shadow-sm",
                  "sm:focus-visible:ring-1 sm:focus-visible:ring-ring"
                )}
                aria-label="Search affiliates"
              />
              {searchInput ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute end-1.5 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground sm:end-1 sm:size-7"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <X className="size-3.5" strokeWidth={2} aria-hidden />
                </Button>
              ) : null}
            </div>
            <Button type="button" variant="outline" onClick={handleApplySearch}>
              Apply
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {affiliatesQuery.isLoading ? (
            <Skeleton className="h-72 w-full rounded-none" />
          ) : affiliatesQuery.isError ? (
            <div className="border-t px-4 py-10 sm:px-6">
              <Alert>
                <AlertDescription>Unable to load affiliates.</AlertDescription>
              </Alert>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={affiliatesQuery.data ?? []}
              emptyLabel="No affiliates found."
              showToolbar={false}
              showColumnToggle={false}
              embedded
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
