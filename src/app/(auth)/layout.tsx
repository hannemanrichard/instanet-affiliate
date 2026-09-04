import { AuthBrandShell } from "@/shared/components/auth/AuthBrandShell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthBrandShell>{children}</AuthBrandShell>;
}
