import type { Metadata } from "next";
import { Shell } from "@/shared/components";
import { RoleGuard } from "@/shared/components/auth/RoleGuard";
import { ClaimsManagementView } from "./ClaimsManagementView";

export const metadata: Metadata = {
  title: "Claims | Instanet",
  description: "Review and treat affiliate claims",
};

export default function ClaimsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <Shell>
        <div className="space-y-6">
          <div className="hidden items-center justify-between md:flex">
            <h1 className="text-3xl font-bold tracking-tight">Claims</h1>
          </div>
          <ClaimsManagementView />
        </div>
      </Shell>
    </RoleGuard>
  );
}
