import { Suspense } from "react";
import { SignInForm } from "@/shared/components/auth/SignInForm";
import { Skeleton } from "@/shared/components/ui/skeleton";

const SignInFallback = () => (
  <div className="w-full space-y-4 rounded-xl border border-border bg-card p-6 sm:p-8">
    <Skeleton className="mx-auto h-7 w-40" />
    <Skeleton className="mx-auto h-4 w-56" />
    <Skeleton className="h-11 w-full" />
    <Skeleton className="h-11 w-full" />
    <Skeleton className="h-11 w-full" />
  </div>
);

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInForm />
    </Suspense>
  );
}
