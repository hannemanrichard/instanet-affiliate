import type { Metadata } from "next";
import { Shell } from "@/shared/components";
import { RoleGuard } from "@/shared/components/auth/RoleGuard";
import { InventoryManagementView } from "@/features/inventory";

export const metadata: Metadata = {
  title: "Inventory Management",
  description: "Monitor stock levels and adjust product inventory.",
};

export default function InventoryDashboardPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <Shell>
        <div className="space-y-6">
          <InventoryManagementView />
        </div>
      </Shell>
    </RoleGuard>
  );
}
