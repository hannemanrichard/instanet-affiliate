import type { Metadata } from "next";
import { Shell } from "@/shared/components";
import { RoleGuard } from "@/shared/components/auth/RoleGuard";
import { EarningsManagementView } from "@/features/earnings";

export const metadata: Metadata = {
  title: "Withdrawals | Instanet",
  description: "Review affiliate earnings and withdrawal requests",
};

export default function WithdrawalsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <Shell>
        <div className="space-y-6">
          <div className="hidden items-center justify-between md:flex">
            <h1 className="text-3xl font-bold tracking-tight">Withdrawals</h1>
          </div>
          <EarningsManagementView showEarningTables={false} />
        </div>
      </Shell>
    </RoleGuard>
  );
}
