import type { Metadata } from "next";
import { Shell } from "@/shared/components";
import { DashboardPageHeader } from "@/shared/components/layout/DashboardPageHeader";
import { OrdersManagementView } from "@/features/orders";

export const metadata: Metadata = {
  title: "Orders | Instanet",
  description: "Browse and create your affiliate orders",
};

export default function OrdersPage() {
  return (
    <Shell>
      <div className="min-w-0 max-w-full space-y-6">
        <DashboardPageHeader section="orders" />
        <OrdersManagementView />
      </div>
    </Shell>
  );
}
