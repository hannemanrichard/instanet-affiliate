"use client";

import { cn } from "@/shared/utils/utils";

type LoaderProps = {
  className?: string;
  /** Scales the bar animation (`--size`). Default matches the source CSS. */
  size?: number;
  /** Accessible label for screen readers. */
  label?: string;
};

export const Loader = ({
  className,
  size = 0.75,
  label = "Loading",
}: LoaderProps) => (
  <span
    className={cn("ba-loader", className)}
    style={{ ["--size" as string]: `${size}px` }}
    role="status"
    aria-label={label}
  />
);
