"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";

export default function SignOutPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    signOut(() => router.push("/"));
  }, [signOut, router]);

  return <div className="text-center p-8">Signing out...</div>;
}
