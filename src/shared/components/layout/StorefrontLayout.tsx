import { cn } from "@/shared/utils/utils";
import { StorefrontFooter } from "./StorefrontFooter";
import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontInfoBar } from "./StorefrontInfoBar";

interface StorefrontLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const StorefrontLayout = ({
  children,
  className,
}: StorefrontLayoutProps) => {
  return (
    <div className="min-h-screen bg-muted/10">
      <StorefrontInfoBar />
      <StorefrontHeader />
      <main className={cn("pb-16", className)}>{children}</main>
      <StorefrontFooter />
    </div>
  );
};
