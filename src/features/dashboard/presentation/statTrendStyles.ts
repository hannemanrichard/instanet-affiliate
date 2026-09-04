import type { IconSvgElement } from "@hugeicons/react";
import { uiIcons } from "@/shared/components/layout/navIcons";

export type StatTrendDirection = "up" | "down" | "flat";

export const resolveStatTrendDirection = (
  changePercent: number
): StatTrendDirection => {
  if (changePercent > 0) return "up";
  if (changePercent < 0) return "down";
  return "flat";
};

export const STAT_TREND_ARROW: Record<
  StatTrendDirection,
  IconSvgElement | null
> = {
  up: uiIcons.arrowUp,
  down: uiIcons.arrowDown,
  flat: null,
};

/** Matches StatsCard trend colors. */
export const STAT_TREND_TONE: Record<StatTrendDirection, string> = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
};

/** Matches StatsCard corner icon chrome: rounded-md, no border. */
export const STAT_CARD_ICON_TILE =
  "hidden h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary sm:flex";
