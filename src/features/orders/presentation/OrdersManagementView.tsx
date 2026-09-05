"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  CheckCircle2,
  ClipboardList,
  Package,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { DataTable } from "@/shared/components/ui/data-table/data-table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import StatsCard from "@/shared/components/ui/StatsCard";
import { AppIcon } from "@/shared/components/layout/AppIcon";
import { uiIcons } from "@/shared/components/layout/navIcons";
import { cn } from "@/shared/utils/utils";
import { formatRelativeDate } from "@/shared/utils/formatRelativeDate";
import { useCurrentPartner } from "@/features/partners";
import { useAuth } from "@/shared/hooks/use-auth";
import { useOrderSummary, usePaginatedOrders } from "../application";
import type { OrderEntity } from "../domain";
import { ORDER_STATUS_OPTIONS } from "../domain";
import { CreateOrderDialog } from "./CreateOrderDialog";
import { OrderRowActions } from "./OrderRowActions";
import { OrderCustomerCell } from "./OrderCustomerCell";
import { OrderContactCell } from "./OrderContactCell";
import { OrderProductCell } from "./OrderProductCell";
import { OrderAmountCell } from "./OrderAmountCell";
import { OrderStatusBadge } from "./OrderStatusBadge";
import {
  formatOrderStatusLabel,
  getOrderStatusIcon,
} from "./orderTableUtils";

const PAGE_SIZE = 25;

const formatAmount = (amount?: number | null) => {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(amount);
};

export const OrdersManagementView = () => {
  const t = useTranslations("affiliateDashboard.orders");
  const tDash = useTranslations("affiliateDashboard");
  const locale = useLocale();
  const { isAdmin, isLoaded } = useAuth();
  const { partnerId, isLoading: partnerLoading } = useCurrentPartner();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filters = useMemo(
    () => ({
      status: status === "all" ? undefined : status,
      search: appliedSearch.trim() || undefined,
    }),
    [appliedSearch, status]
  );

  const ordersEnabled =
    isLoaded && (isAdmin || (!partnerLoading && partnerId != null));
  const ordersQuery = usePaginatedOrders(
    filters,
    page,
    PAGE_SIZE,
    ordersEnabled
  );
  const summaryQuery = useOrderSummary(ordersEnabled);
  const pageOrders = ordersQuery.data?.data ?? [];

  useEffect(() => {
    setPage(1);
  }, [status, appliedSearch]);

  const handleApplySearch = () => {
    const next = searchInput.trim();
    setSearchInput(next);
    setAppliedSearch(next);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleApplySearch();
  };

  const columns = [
    {
      key: "customer",
      label: t("columns.customer"),
      render: (order: OrderEntity) => <OrderCustomerCell order={order} />,
    },
    {
      key: "contact",
      label: t("columns.contact"),
      render: (order: OrderEntity) => (
        <OrderContactCell
          order={order}
          callAria={t("callPhoneAria", {
            phone: order.phone?.trim() || "",
          })}
        />
      ),
    },
    {
      key: "status",
      label: t("columns.status"),
      render: (order: OrderEntity) => <OrderStatusBadge order={order} />,
    },
    {
      key: "product",
      label: t("columns.product"),
      render: (order: OrderEntity) => <OrderProductCell order={order} />,
    },
    {
      key: "amount",
      label: t("commissionLabel"),
      render: (order: OrderEntity) => (
        <OrderAmountCell
          order={order}
          currency={tDash("currencySymbol")}
        />
      ),
    },
    {
      key: "created_at",
      label: t("columns.created"),
      render: (order: OrderEntity) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatRelativeDate(order.created_at, locale)}
        </span>
      ),
    },
    {
      key: "actions",
      label: t("columns.actions"),
      render: (order: OrderEntity) => <OrderRowActions order={order} />,
    },
  ];

  if (!isLoaded || (!isAdmin && partnerLoading)) {
    return (
      <div className="min-w-0 space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-2 h-6 w-10" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin && partnerId == null) {
    return (
      <Alert>
        <AlertDescription>{t("partnerUnresolved")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="grid min-w-0 grid-cols-3 gap-2 sm:gap-3">
        <StatsCard
          title={t("stats.total")}
          value={summaryQuery.data?.total_orders ?? 0}
          icon={ClipboardList}
        />
        <StatsCard
          title={t("stats.processing")}
          value={summaryQuery.data?.total_processing ?? 0}
          icon={Package}
        />
        <StatsCard
          title={t("stats.delivered")}
          value={summaryQuery.data?.total_delivered ?? 0}
          icon={CheckCircle2}
        />
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-0 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-xs">
                <Search
                  className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground sm:start-3"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <Input
                  value={searchInput}
                  onChange={(event) => {
                    setSearchInput(event.target.value);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={t("searchPlaceholder")}
                  className={cn(
                    "h-11 border-0 bg-transparent pe-11 ps-11 shadow-none",
                    "placeholder:text-muted-foreground/70",
                    "focus-visible:ring-0",
                    "sm:h-9 sm:border sm:border-input sm:bg-background sm:pe-9 sm:ps-9 sm:shadow-sm",
                    "sm:focus-visible:ring-1 sm:focus-visible:ring-ring"
                  )}
                  aria-label={t("searchAria")}
                />
                {searchInput ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute end-1.5 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground sm:end-1 sm:size-7"
                    onClick={handleClearSearch}
                    aria-label={t("clearSearch")}
                  >
                    <X className="size-3.5" strokeWidth={2} aria-hidden />
                  </Button>
                ) : null}
              </div>
              <div className="flex w-full items-stretch overflow-hidden rounded-lg border border-input bg-background shadow-sm sm:w-auto">
                <Select
                  value={status}
                  onValueChange={(value) => {
                    setStatus(value);
                  }}
                >
                  <SelectTrigger
                    className="h-9 w-full rounded-none border-0 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 sm:w-44"
                    aria-label={t("statusFilterAria")}
                  >
                    <SelectValue placeholder={t("statusPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allStatuses")}</SelectItem>
                    {ORDER_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        <span className="flex items-center gap-2">
                          <AppIcon
                            icon={uiIcons[getOrderStatusIcon(option)]}
                            size={14}
                            strokeWidth={0}
                            className="text-muted-foreground"
                          />
                          {formatOrderStatusLabel(option)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {!isAdmin ? (
              <Button
                type="button"
                size="lg"
                className="h-11 w-full shrink-0 gap-2 font-semibold shadow-md sm:h-10 sm:w-auto sm:px-5"
                onClick={() => setIsCreateOpen(true)}
                aria-label={t("createOrderAria")}
              >
                <AppIcon icon={uiIcons.newOrder} size={18} />
                {t("createOrder")}
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {ordersQuery.isLoading && page === 1 ? (
            <Skeleton className="h-72 w-full rounded-none" />
          ) : (
            <DataTable
              columns={columns}
              data={pageOrders}
              totalItems={ordersQuery.data?.total ?? 0}
              currentPage={page}
              pageSize={PAGE_SIZE}
              onPageChange={(nextPage) => {
                setPage(nextPage);
              }}
              emptyLabel={t("empty")}
              showToolbar={false}
              showColumnToggle={false}
              showPageSizeSelector={false}
              embedded
            />
          )}
          <p className="border-t px-4 py-3 text-xs text-muted-foreground sm:px-6">
            {t("orderValueSummary", {
              amount: formatAmount(summaryQuery.data?.total_value),
              currency: tDash("currencySymbol"),
            })}
          </p>
        </CardContent>
      </Card>

      {!isAdmin ? (
        <CreateOrderDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      ) : null}
    </div>
  );
};
