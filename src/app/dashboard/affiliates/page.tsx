import type { Metadata } from "next";
import { Shell } from "@/shared/components";
import { RoleGuard } from "@/shared/components/auth/RoleGuard";
import { AffiliatesManagementView } from "./AffiliatesManagementView";

export const metadata: Metadata = {
  title: "Affiliates | Instanet",
  description: "Manage affiliate accounts and payment details",
};

export default function AffiliatesPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <Shell>
        <div className="space-y-6">
          <div className="hidden items-center justify-between md:flex">
            <h1 className="text-3xl font-bold tracking-tight">Affiliates</h1>
          </div>
          <AffiliatesManagementView />
        </div>
      </Shell>
    </RoleGuard>
  );
}
