"use client";

import { useTranslations } from "next-intl";
import { AppIcon } from "@/shared/components/layout/AppIcon";
import { uiIcons } from "@/shared/components/layout/navIcons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  DASHBOARD_DATE_RANGE_PRESETS,
  type DashboardDateRangePreset,
} from "../domain";

type DashboardDateRangeSelectProps = {
  value: DashboardDateRangePreset;
  onChange: (preset: DashboardDateRangePreset) => void;
};

const PRESET_LABEL_KEYS: Record<DashboardDateRangePreset, string> = {
  last_7_days: "dateRange.last7Days",
  last_14_days: "dateRange.last14Days",
  last_30_days: "dateRange.last30Days",
  last_90_days: "dateRange.last90Days",
  this_month: "dateRange.thisMonth",
};

export const DashboardDateRangeSelect = ({
  value,
  onChange,
}: DashboardDateRangeSelectProps) => {
  const t = useTranslations("affiliateDashboard.home");

  const handleValueChange = (preset: string) => {
    onChange(preset as DashboardDateRangePreset);
  };

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger
        className="h-10 w-full gap-2 border-input bg-background shadow-sm sm:h-9 sm:w-52"
        aria-label={t("dateRange.aria")}
      >
        <AppIcon
          icon={uiIcons.calendar}
          size={16}
          className="shrink-0 text-muted-foreground"
        />
        <SelectValue placeholder={t("dateRange.placeholder")} />
      </SelectTrigger>
      <SelectContent>
        {DASHBOARD_DATE_RANGE_PRESETS.map((preset) => (
          <SelectItem key={preset} value={preset}>
            {t(PRESET_LABEL_KEYS[preset])}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
