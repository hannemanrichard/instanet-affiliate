"use client";

import { useAuth } from "@/shared/hooks/use-auth";
import { redirect } from "next/navigation";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "partner")[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoaded, isAdmin, isPartner } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!user) {
    redirect("/sign-in");
  }

  const hasAccess =
    (allowedRoles.includes("admin") && isAdmin) ||
    (allowedRoles.includes("partner") && isPartner);

  if (!hasAccess) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
