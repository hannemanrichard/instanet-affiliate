"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import type { DashboardSeriesPoint } from "../domain";
import { formatChartAxisDate, formatDashboardAmount } from "./dashboardFormatters";

type DashboardTrendChartProps = {
  title: string;
  data: DashboardSeriesPoint[];
  type: "line" | "bar";
  seriesLabel: string;
  ariaLabel: string;
  formatValue?: (value: number) => string;
};

export const DashboardTrendChart = ({
  title,
  data,
  type,
  seriesLabel,
  ariaLabel,
  formatValue = formatDashboardAmount,
}: DashboardTrendChartProps) => {
  const chartConfig = {
    value: {
      label: seriesLabel,
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const handleTickFormat = (value: string) => formatChartAxisDate(value);
  const gradientId = `trend-fill-${type}-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="space-y-0 border-b border-border/60 bg-muted/20 px-4 py-3.5 sm:px-5">
        <CardTitle className="text-sm font-semibold tracking-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-3 pt-4 sm:px-3 sm:pb-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[240px] w-full"
          aria-label={ariaLabel}
        >
          {type === "line" ? (
            <LineChart
              data={data}
              margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.18}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 6" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                minTickGap={28}
                tickMargin={8}
                tickFormatter={handleTickFormat}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={52}
                tickMargin={4}
                tickFormatter={(value: number) => formatValue(value)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      typeof value === "string"
                        ? formatChartAxisDate(value)
                        : String(value)
                    }
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill={`url(#${gradientId})`}
                isAnimationActive
                animationDuration={600}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={2.25}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive
                animationDuration={600}
              />
            </LineChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 6" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                minTickGap={28}
                tickMargin={8}
                tickFormatter={handleTickFormat}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                allowDecimals={false}
                tickMargin={4}
                tickFormatter={(value: number) => formatValue(value)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      typeof value === "string"
                        ? formatChartAxisDate(value)
                        : String(value)
                    }
                  />
                }
              />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={[8, 8, 0, 0]}
                maxBarSize={36}
                isAnimationActive
                animationDuration={600}
              />
            </BarChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
