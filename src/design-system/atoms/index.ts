/**
 * Atoms — primitive UI building blocks (shadcn-backed).
 * Prefer importing from `@/design-system` in new code.
 */
export {
  Button,
  buttonVariants,
  type ButtonProps,
} from "@/shared/components/ui/button";
export { Badge, badgeVariants, type BadgeProps } from "@/shared/components/ui/badge";
export { Input } from "@/shared/components/ui/input";
export { Label } from "@/shared/components/ui/label";
export { Textarea } from "@/shared/components/ui/textarea";
export { Checkbox } from "@/shared/components/ui/checkbox";
export { Switch } from "@/shared/components/ui/switch";
export { Separator } from "@/shared/components/ui/separator";
export { Skeleton } from "@/shared/components/ui/skeleton";
export { Loader } from "@/shared/components/ui/loader";
export { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
export { default as StatsCard } from "@/shared/components/ui/StatsCard";
export type {
  StatsCardProps,
  StatsCardTone,
} from "@/shared/components/ui/StatsCard";
