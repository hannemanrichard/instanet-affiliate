import { Suspense } from "react";
import { SignUpForm } from "@/shared/components/auth/SignUpForm";
import { Skeleton } from "@/shared/components/ui/skeleton";

const SignUpFallback = () => (
  <div className="w-full space-y-4 rounded-xl border border-border bg-card p-6 sm:p-8">
    <Skeleton className="mx-auto h-7 w-48" />
    <Skeleton className="mx-auto h-4 w-64" />
    <Skeleton className="h-11 w-full" />
    <Skeleton className="h-11 w-full" />
    <Skeleton className="h-11 w-full" />
    <Skeleton className="h-11 w-full" />
  </div>
);

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpFallback />}>
      <SignUpForm />
    </Suspense>
  );
}
