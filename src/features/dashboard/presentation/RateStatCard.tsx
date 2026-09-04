"use client";

import type { LucideIcon } from "lucide-react";
import { AppIcon } from "@/shared/components/layout/AppIcon";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils/utils";
import type { DashboardRateStat } from "../domain";
import { formatTrendPercent } from "./dashboardFormatters";
import {
  resolveStatTrendDirection,
  STAT_CARD_ICON_TILE,
  STAT_TREND_ARROW,
  STAT_TREND_TONE,
} from "./statTrendStyles";

type RateStatCardProps = {
  title: string;
  stat: DashboardRateStat;
  icon: LucideIcon;
};

export const RateStatCard = ({ title, stat, icon: Icon }: RateStatCardProps) => {
  const trendDirection = resolveStatTrendDirection(stat.changePercent);
  const trendArrow = STAT_TREND_ARROW[trendDirection];
  const trendValue = formatTrendPercent(stat.changePercent);

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-medium leading-none text-muted-foreground">
              {title}
            </p>
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
              <p
                className="text-3xl font-semibold leading-none tracking-tight tabular-nums"
                aria-label={`${title}: ${Math.round(stat.ratePercent)}%`}
              >
                {Math.round(stat.ratePercent)}
                <span className="ms-0.5 text-lg font-semibold text-muted-foreground">
                  %
                </span>
              </p>
              <p
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-medium leading-none tabular-nums",
                  STAT_TREND_TONE[trendDirection]
                )}
                aria-label={`${trendValue} ${trendDirection}`}
              >
                <span>{trendValue}</span>
                {trendArrow ? (
                  <AppIcon icon={trendArrow} size={14} strokeWidth={0} />
                ) : null}
              </p>
            </div>
          </div>
          <span className={STAT_CARD_ICON_TILE} aria-hidden>
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
