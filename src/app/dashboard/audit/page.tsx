import type { Metadata } from "next";
import { Shell } from "@/shared/components";
import { RoleGuard } from "@/shared/components/auth/RoleGuard";
import { AuditManagementView } from "./AuditManagementView";

export const metadata: Metadata = {
  title: "Audit | Instanet",
  description: "Browse recent audit log activity",
};

export default function AuditPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <Shell>
        <div className="space-y-6">
          <div className="hidden items-center justify-between md:flex">
            <h1 className="text-3xl font-bold tracking-tight">Audit</h1>
          </div>
          <AuditManagementView />
        </div>
      </Shell>
    </RoleGuard>
  );
}
