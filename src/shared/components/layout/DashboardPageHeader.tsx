"use client";

import { useTranslations } from "next-intl";

type DashboardSection = "home" | "orders" | "earnings" | "products" | "settings";

interface DashboardPageHeaderProps {
  section: DashboardSection;
}

export const DashboardPageHeader = ({ section }: DashboardPageHeaderProps) => {
  const t = useTranslations(`affiliateDashboard.${section}`);

  return (
    <div className="hidden items-center justify-between md:flex">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
    </div>
  );
};
