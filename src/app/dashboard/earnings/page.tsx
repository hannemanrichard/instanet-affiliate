import type { Metadata } from "next";
import { Shell } from "@/shared/components";
import { DashboardPageHeader } from "@/shared/components/layout/DashboardPageHeader";
import { EarningsManagementView } from "@/features/earnings";

export const metadata: Metadata = {
  title: "Earnings | Instanet",
  description: "Track your commissions and request withdrawals",
};

export default function EarningsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <DashboardPageHeader section="earnings" />
        <EarningsManagementView />
      </div>
    </Shell>
  );
}
