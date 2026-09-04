"use client";

import { cn } from "@/shared/utils/utils";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import React from "react";
import { Card, CardContent } from "@/shared/components/ui/card";

export type StatsCardTone = "primary" | "muted";

export interface StatsCardProps {
  title: string;
  /** Numeric value when using `valueType`, or omit if `displayValue` is set. */
  value?: number;
  valueType?: "percentage" | "number" | "currency";
  /** Pre-formatted value; takes precedence over `value` / `valueType`. */
  displayValue?: React.ReactNode;
  icon: LucideIcon;
  /** Decorative icon tone. Prefer `primary`. */
  tone?: StatsCardTone;
  trend?: {
    value: string;
    positive: boolean;
  };
  /** Optional action below the value (e.g. withdraw button). */
  action?: React.ReactNode;
  className?: string;
}

const toneIconWrap: Record<StatsCardTone, string> = {
  primary: "bg-primary/10 text-primary",
  muted: "bg-muted text-muted-foreground",
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value = 0,
  valueType = "number",
  displayValue,
  trend,
  className,
  icon: Icon,
  tone = "primary",
  action,
}) => {
  const formatValue = () => {
    switch (valueType) {
      case "percentage":
        return `${value}%`;
      case "currency":
        return `${value.toLocaleString()} DA`;
      case "number":
      default:
        return value.toLocaleString();
    }
  };

  const TrendIcon = trend?.positive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className={cn("min-w-0", className)}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="truncate text-xs font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-lg font-semibold tracking-tight sm:text-2xl">
              {displayValue ?? formatValue()}
            </p>
            {trend ? (
              <div className="flex items-center gap-1 pt-0.5">
                <TrendIcon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    trend.positive ? "text-primary" : "text-destructive"
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.positive ? "text-primary" : "text-destructive"
                  )}
                >
                  {trend.value}
                </span>
              </div>
            ) : null}
            {action ? <div className="pt-2.5">{action}</div> : null}
          </div>
          <div
            className={cn(
              "hidden h-8 w-8 shrink-0 items-center justify-center rounded-md sm:flex",
              toneIconWrap[tone]
            )}
            aria-hidden
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
