"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Medal,
  Package,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Shell } from "@/shared/components/shells/Shell";
import { DashboardPageHeader } from "@/shared/components/layout/DashboardPageHeader";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAuth } from "@/shared/hooks/use-auth";
import { useDashboardOverview } from "../application";
import {
  type DashboardPerformer,
  resolveDashboardDateRange,
  type DashboardDateRangePreset,
} from "../domain";
import { DashboardDateRangeSelect } from "./DashboardDateRangeSelect";
import { DashboardTrendChart } from "./DashboardTrendChart";
import { formatDashboardAmount } from "./dashboardFormatters";
import { RateStatCard } from "./RateStatCard";
import { SalesStatCard } from "./SalesStatCard";

const DashboardHomeSkeleton = () => (
  <div className="space-y-4">
    <div className="grid min-w-0 grid-cols-3 gap-2 sm:gap-3">
      <Skeleton className="h-[7.5rem] w-full rounded-xl" />
      <Skeleton className="h-[7.5rem] w-full rounded-xl" />
      <Skeleton className="h-[7.5rem] w-full rounded-xl" />
    </div>
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <Skeleton className="h-80 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  </div>
);

const getPerformerInitials = (label: string) =>
  label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const TopPerformersCard = ({
  title,
  items,
  metricLabel,
  metricText,
  currency,
  emptyLabel,
  icon: Icon,
  showAvatar = true,
}: {
  title: string;
  items: DashboardPerformer[];
  metricLabel: "sales" | "orders";
  metricText: string;
  currency: string;
  emptyLabel: string;
  icon: typeof TrendingUp;
  showAvatar?: boolean;
}) => (
  <Card className="min-w-0 overflow-hidden border-border/70">
    <CardHeader className="border-b bg-muted/20 pb-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Top 5 leaderboard</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item.key}-${metricLabel}`}
              className="flex items-center justify-between gap-3 rounded-2xl border bg-background px-3 py-3 shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    index === 0
                      ? "bg-amber-100 text-amber-700"
                      : index === 1
                        ? "bg-slate-200 text-slate-700"
                        : index === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < 3 ? <Medal className="size-4" /> : index + 1}
                </div>
                {showAvatar ? (
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-1 ring-border">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      getPerformerInitials(item.label)
                    )}
                  </div>
                ) : null}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {item.label}
                  </p>
                  {item.secondaryLabel ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {item.secondaryLabel}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold tabular-nums text-foreground">
                  {metricLabel === "sales"
                    ? `${formatDashboardAmount(item.salesAmount)} ${currency}`
                    : item.orderCount.toLocaleString()}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {metricText}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export const DashboardHomeView = () => {
  const t = useTranslations("affiliateDashboard.home");
  const currency = useTranslations("affiliateDashboard")("currencySymbol");
  const { isAdmin } = useAuth();
  const [preset, setPreset] = useState<DashboardDateRangePreset>("last_30_days");
  const range = useMemo(() => resolveDashboardDateRange(preset), [preset]);
  const overviewScope = isAdmin ? "platform" : "partner";
  const overviewQuery = useDashboardOverview(overviewScope, range);
  const overview = overviewQuery.data;

  const handlePresetChange = (nextPreset: DashboardDateRangePreset) => {
    setPreset(nextPreset);
  };

  return (
    <Shell>
      <div className="min-w-0 max-w-full space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <DashboardPageHeader section="home" />
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
              {t("subtitle")}
            </p>
          </div>
          <div className="w-full shrink-0 sm:w-auto">
            <DashboardDateRangeSelect
              value={preset}
              onChange={handlePresetChange}
            />
          </div>
        </div>

        {overviewQuery.isLoading ? (
          <DashboardHomeSkeleton />
        ) : overviewQuery.isError || !overview ? (
          <Alert>
            <AlertDescription>{t("loadError")}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <section
              className="grid min-w-0 grid-cols-3 gap-2 sm:gap-3"
              aria-label={t("metricsAria")}
            >
              <RateStatCard
                title={t("deliveryRate")}
                stat={overview.delivery}
                icon={Package}
              />
              <RateStatCard
                title={t("confirmationRate")}
                stat={overview.confirmation}
                icon={CheckCircle2}
              />
              <SalesStatCard
                title={t("sales")}
                displayValue={`${formatDashboardAmount(overview.sales.total)} ${currency}`}
                changePercent={overview.sales.changePercent}
                icon={Wallet}
              />
            </section>

            <section
              className="grid grid-cols-1 gap-3 lg:grid-cols-2"
              aria-label={t("activityAria")}
            >
              <DashboardTrendChart
                title={t("salesRecent")}
                data={overview.salesSeries}
                type="line"
                seriesLabel={t("sales")}
                ariaLabel={t("salesRecentAria")}
              />
              <DashboardTrendChart
                title={t("ordersRecent")}
                data={overview.ordersSeries}
                type="bar"
                seriesLabel={t("orders")}
                ariaLabel={t("ordersRecentAria")}
                formatValue={(value) => formatDashboardAmount(value)}
              />
            </section>

            {isAdmin ? (
              <section className="space-y-3" aria-label={t("topPerformersAria")}>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {t("topPerformersTitle")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("topPerformersSubtitle")}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  <TopPerformersCard
                    title={t("topProductsBySales")}
                    items={overview.topProductsBySales}
                    metricLabel="sales"
                    metricText={t("sales")}
                    currency={currency}
                    emptyLabel={t("topProductsEmpty")}
                    icon={TrendingUp}
                    showAvatar={false}
                  />
                  <TopPerformersCard
                    title={t("topProductsByOrders")}
                    items={overview.topProductsByOrders}
                    metricLabel="orders"
                    metricText={t("orders")}
                    currency={currency}
                    emptyLabel={t("topProductsEmpty")}
                    icon={ShoppingCart}
                    showAvatar={false}
                  />
                  <TopPerformersCard
                    title={t("topAffiliatesBySales")}
                    items={overview.topAffiliatesBySales}
                    metricLabel="sales"
                    metricText={t("sales")}
                    currency={currency}
                    emptyLabel={t("topAffiliatesEmpty")}
                    icon={TrendingUp}
                  />
                  <TopPerformersCard
                    title={t("topAffiliatesByOrders")}
                    items={overview.topAffiliatesByOrders}
                    metricLabel="orders"
                    metricText={t("orders")}
                    currency={currency}
                    emptyLabel={t("topAffiliatesEmpty")}
                    icon={ShoppingCart}
                  />
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </Shell>
  );
};
