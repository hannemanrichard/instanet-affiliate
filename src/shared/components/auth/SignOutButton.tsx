"use client";

import { Button } from "@/shared/components/ui/button";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = () => {
    signOut(() => router.push("/"));
  };

  return (
    <Button onClick={handleSignOut} variant="ghost">
      Sign Out
    </Button>
  );
}
