import { BrandLogo } from "@/shared/components/layout/BrandLogo";
import { cn } from "@/shared/utils/utils";

type AuthLogoProps = {
  className?: string;
};

/** Same Instanet mark used in the dashboard sidebar. */
export const AuthLogo = ({ className }: AuthLogoProps) => (
  <BrandLogo className={cn(className)} priority />
);
