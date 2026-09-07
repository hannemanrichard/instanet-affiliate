"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { useLocale } from "next-intl";
import {
  BadgePercent,
  CircleDollarSign,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { Activity01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Loader } from "@/shared/components/ui/loader";
import StatsCard from "@/shared/components/ui/StatsCard";
import { DataTable } from "@/shared/components/ui/data-table/data-table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { AppIcon } from "@/shared/components/layout/AppIcon";
import {
  useStandardMutation,
  useStandardQuery,
} from "@/shared/hooks/useReactQuery";
import { apiFetch } from "@/shared/utils/apiFetch";
import { formatRelativeDate } from "@/shared/utils/formatRelativeDate";
import { cn } from "@/shared/utils/utils";
import type { PartnerEntity } from "@/features/partners/domain";

type RecentCommission = {
  id: number;
  productName?: string;
  quantity: number;
  commissionAmount: number;
  status?: string;
  createdAt: string;
};

type AffiliateStats = {
  partner: PartnerEntity;
  totalOrders: number;
  confirmationRate: number;
  deliveryRate: number;
  totalCommissions: number;
  readyCommissions: number;
  pendingCommissions: number;
};

type UpdatePartnerStatusPayload = {
  partnerId: number;
  status: "active" | "inactive";
};

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

const getPartnerStatusBadgeClassName = (isActive: boolean) =>
  isActive
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-rose-200 bg-rose-50 text-rose-700";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(amount);

const AffiliateStatsDialog = ({ partner }: { partner: PartnerEntity }) => {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const partnerLabel =
    partner.fullname?.trim() || partner.username?.trim() || `Affiliate #${partner.id}`;

  const statsQuery = useStandardQuery(
    ["dashboard", "affiliate-stats", partner.id],
    () =>
      apiFetch<AffiliateStats>(
        `/api/dashboard/affiliates/stats?partnerId=${partner.id}`
      ),
    {
      enabled: open,
      staleTime: 30 * 1000,
    }
  );

  const stats = statsQuery.data;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={`View stats for ${partnerLabel}`}
        >
          <AppIcon icon={Activity01Icon} size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Affiliate stats</DialogTitle>
          <DialogDescription>
            Review performance, commissions, and recent activity for {partnerLabel}.
          </DialogDescription>
        </DialogHeader>

        {statsQuery.isLoading ? (
          <div className="flex min-h-60 items-center justify-center">
            <Loader className="text-muted-foreground" label="Loading affiliate stats" />
          </div>
        ) : statsQuery.isError || !stats ? (
          <Alert>
            <AlertDescription>Unable to load affiliate stats.</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-5 overflow-y-auto pe-1">
            <div className="flex flex-col gap-4 rounded-2xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                {stats.partner.avatar?.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={stats.partner.avatar}
                    alt=""
                    className="size-14 shrink-0 rounded-full object-cover ring-1 ring-border"
                  />
                ) : (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground ring-1 ring-border">
                    {getPartnerInitials(stats.partner)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-foreground">
                    {partnerLabel}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {stats.partner.email?.trim() || "No email"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {stats.partner.username?.trim()
                      ? `@${stats.partner.username.trim()}`
                      : "No username"}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={getPartnerStatusBadgeClassName(
                  stats.partner.status === "active"
                )}
              >
                {stats.partner.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <StatsCard
                title="Delivery rate"
                value={stats.deliveryRate}
                valueType="percentage"
                icon={BadgePercent}
              />
              <StatsCard
                title="Confirmation rate"
                value={stats.confirmationRate}
                valueType="percentage"
                icon={ShoppingBag}
              />
              <div className="rounded-xl border bg-background p-4">
                <p className="text-xs font-medium text-muted-foreground">Total orders</p>
                <p className="pt-1 text-2xl font-semibold tabular-nums">
                  {stats.totalOrders.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <StatsCard
                title="Total commissions"
                value={stats.totalCommissions}
                valueType="currency"
                icon={CircleDollarSign}
              />
              <StatsCard
                title="Ready commissions"
                value={stats.readyCommissions}
                valueType="currency"
                icon={CircleDollarSign}
                tone="muted"
              />
              <div className="rounded-xl border bg-background p-4">
                <p className="text-xs font-medium text-muted-foreground">Pending commissions</p>
                <p className="pt-1 text-2xl font-semibold tabular-nums">
                  {formatAmount(stats.pendingCommissions)} DA
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const AffiliatesManagementView = () => {
  const locale = useLocale();
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const updatePartnerStatusMutation = useStandardMutation<
    { partner: PartnerEntity },
    UpdatePartnerStatusPayload
  >(
    ({ partnerId, status }) =>
      apiFetch<{ partner: PartnerEntity }>(
        `/api/dashboard/affiliates/status?partnerId=${partnerId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      ),
    {
      invalidateQueries: [["dashboard", "affiliates"], ["dashboard", "affiliate-stats"]],
      successMessage: "Affiliate status updated successfully",
      errorMessage: "Unable to update affiliate status",
    }
  );

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
            <Badge
              variant="outline"
              className={getPartnerStatusBadgeClassName(isActive)}
            >
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
      {
        key: "stats",
        label: "Stats",
        render: (partner: PartnerEntity) => <AffiliateStatsDialog partner={partner} />,
      },
      {
        key: "actions",
        label: "Actions",
        render: (partner: PartnerEntity) => {
          const isActive = partner.status === "active";
          const nextStatus = isActive ? "inactive" : "active";

          return (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={updatePartnerStatusMutation.isPending}
              onClick={() =>
                updatePartnerStatusMutation.mutate({
                  partnerId: partner.id,
                  status: nextStatus,
                })
              }
              aria-label={`${isActive ? "Deactivate" : "Activate"} affiliate ${partner.fullname?.trim() || partner.username?.trim() || partner.email?.trim() || partner.id}`}
            >
              {isActive ? "Deactivate" : "Activate"}
            </Button>
          );
        },
      },
    ],
    [locale, updatePartnerStatusMutation]
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
