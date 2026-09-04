"use client";

import { useUser } from "@clerk/nextjs";

export function useAuth() {
  const { user, isLoaded } = useUser();

  const role = user?.publicMetadata?.role;
  const isAdmin = role === "admin";
  const isPartner = role === "partner";
  const roleLabel = isAdmin ? "Admin" : isPartner ? "Partner" : null;

  return {
    isAdmin,
    isLoaded,
    user,
    isPartner,
    roleLabel,
  };
}