import type { Metadata } from "next";
import { Shell } from "@/shared/components";
import { RoleGuard } from "@/shared/components/auth/RoleGuard";
import { MarketplacePostsManagementView } from "./MarketplacePostsManagementView";

export const metadata: Metadata = {
  title: "Posting activity | Instanet",
  description: "Track affiliate Marketplace posting activity",
};

export default function MarketplacePostsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <Shell>
        <div className="space-y-6">
          <div className="hidden items-center justify-between md:flex">
            <h1 className="text-3xl font-bold tracking-tight">
              Posting activity
            </h1>
          </div>
          <MarketplacePostsManagementView />
        </div>
      </Shell>
    </RoleGuard>
  );
}
