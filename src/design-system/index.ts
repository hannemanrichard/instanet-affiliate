/**
 * Instanet design system public API.
 *
 * Design decisions (colors, radius, fonts, sidebar, surfaces):
 *   → edit `src/design-system/tokens.css` and `tokens.ts`
 */

export * from "./tokens";
export * as atoms from "./atoms";
export * as molecules from "./molecules";
export * as organisms from "./organisms";
export * as templates from "./templates";

export {
  Button,
  buttonVariants,
  Badge,
  Input,
  Label,
  Textarea,
  Checkbox,
  Switch,
  Separator,
  Skeleton,
  Loader,
  Avatar,
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./atoms";
export { StatsCard } from "./atoms";
export type { StatsCardProps, StatsCardTone } from "./atoms";

export {
  AffiliateSidebar,
  MobileTabBar,
  DashboardHeader,
  StorefrontHeader,
  StorefrontFooter,
  StorefrontInfoBar,
  StorefrontLayout,
  Shell,
  RoleGuard,
} from "./organisms";
