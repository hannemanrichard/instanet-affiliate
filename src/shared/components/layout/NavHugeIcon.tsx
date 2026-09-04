"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "@/shared/utils/utils";

export type HugeNavIconPair = {
  stroke: IconSvgElement;
  solid: IconSvgElement;
};

type NavHugeIconProps = {
  icons: HugeNavIconPair;
  active?: boolean;
  className?: string;
  size?: number;
};

/**
 * Nav icon: stroke-rounded when idle, solid-rounded when active.
 * Uses currentColor so it matches menu item text.
 */
export const NavHugeIcon = ({
  icons,
  active = false,
  className,
  size = 20,
}: NavHugeIconProps) => (
  <HugeiconsIcon
    icon={active ? icons.solid : icons.stroke}
    size={size}
    color="currentColor"
    strokeWidth={active ? 0 : 1.5}
    className={cn("shrink-0", className)}
    aria-hidden
    style={{ width: size, height: size }}
  />
);
