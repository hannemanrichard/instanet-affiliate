"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "@/shared/utils/utils";

type AppIconProps = {
  icon: IconSvgElement;
  className?: string;
  size?: number;
  /** Use 0 for solid/filled icons. */
  strokeWidth?: number;
};

/** Single Hugeicon that inherits text color via currentColor. */
export const AppIcon = ({
  icon,
  className,
  size = 16,
  strokeWidth = 1.5,
}: AppIconProps) => (
  <HugeiconsIcon
    icon={icon}
    size={size}
    color="currentColor"
    strokeWidth={strokeWidth}
    className={cn("shrink-0", className)}
    aria-hidden
  />
);
