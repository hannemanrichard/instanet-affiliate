"use client";

import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { useAuth } from "@/shared/hooks/use-auth";
import { useTranslations } from "next-intl";
import { DashboardBalanceLink } from "./DashboardBalanceLink";

export const DashboardHeader = () => {
  const t = useTranslations();
  const { roleLabel } = useAuth();

  return (
    <header className="hidden h-16 shrink-0 items-center gap-2 border-b px-4 md:flex">
      <SidebarTrigger className="-ms-1" />
      <Separator orientation="vertical" className="me-2 h-4" />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="text-sm font-medium">{t("navigation.dashboard")}</span>
        {roleLabel ? (
          <Badge variant="secondary" aria-label={`Signed in as ${roleLabel}`}>
            {roleLabel}
          </Badge>
        ) : null}
      </div>
      <DashboardBalanceLink />
    </header>
  );
};
