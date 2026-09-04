import { cn } from "@/shared/utils/utils";
import { LandingFooter } from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";

interface LandingLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const LandingLayout = ({ children, className }: LandingLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main className={cn(className)}>{children}</main>
      <LandingFooter />
    </div>
  );
};
