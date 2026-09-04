"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Package, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { Shell } from "@/shared/components/shells/Shell";
import { DashboardPageHeader } from "@/shared/components/layout/DashboardPageHeader";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useDashboardOverview } from "../application";
import {
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

export const DashboardHomeView = () => {
  const t = useTranslations("affiliateDashboard.home");
  const currency = useTranslations("affiliateDashboard")("currencySymbol");
  const [preset, setPreset] = useState<DashboardDateRangePreset>("last_30_days");
  const range = useMemo(() => resolveDashboardDateRange(preset), [preset]);
  const overviewQuery = useDashboardOverview(range);
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
          </div>
        )}
      </div>
    </Shell>
  );
};
