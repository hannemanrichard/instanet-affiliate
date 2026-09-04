"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils/utils";
import { useCurrentPartner } from "@/features/partners";
import { useEarningsSummary } from "@/features/earnings";
import { AppIcon } from "./AppIcon";
import { uiIcons } from "./navIcons";

const formatBalance = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(amount);

type DashboardBalanceLinkProps = {
  className?: string;
};

/**
 * Available balance chip linking to Earnings — used in mobile and desktop top nav.
 */
export const DashboardBalanceLink = ({
  className,
}: DashboardBalanceLinkProps) => {
  const t = useTranslations("navigation");
  const tDash = useTranslations("affiliateDashboard");
  const { partnerId, isLoading: partnerLoading } = useCurrentPartner();
  const earningsEnabled = !partnerLoading && partnerId != null;
  const earningsQuery = useEarningsSummary(earningsEnabled);
  const balance = earningsQuery.data?.availableToWithdraw ?? 0;
  const currency = tDash("currencySymbol");
  const isBalanceLoading =
    partnerLoading || (earningsEnabled && earningsQuery.isLoading);

  if (isBalanceLoading) {
    return (
      <Skeleton
        className={cn("h-8 w-[5.5rem] shrink-0 rounded-full", className)}
      />
    );
  }

  return (
    <Link
      href="/dashboard/earnings"
      className={cn(
        "inline-flex h-9 max-w-[10rem] shrink-0 items-center gap-1.5 px-1.5",
        "text-sm font-bold tabular-nums text-foreground",
        "transition-opacity hover:opacity-80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      aria-label={t("balanceAria", {
        amount: formatBalance(balance),
        currency,
      })}
    >
      <AppIcon
        icon={uiIcons.walletSolid}
        size={18}
        strokeWidth={0}
        className="text-primary"
      />
      <span className="truncate">
        {formatBalance(balance)}{" "}
        <span className="font-bold text-foreground">{currency}</span>
      </span>
    </Link>
  );
};
