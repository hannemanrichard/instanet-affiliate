"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/shared/utils/utils";

type BrandLogoProps = {
  href?: string;
  /** Show "Affiliate" under the product name. */
  showTagline?: boolean;
  /** Icon-only (no wordmark). */
  markOnly?: boolean;
  className?: string;
  markClassName?: string;
  priority?: boolean;
};

/**
 * Instanet brand mark — always uses `/logo.svg`.
 */
export const BrandLogo = ({
  href = "/dashboard",
  showTagline = true,
  markOnly = false,
  className,
  markClassName,
  priority = false,
}: BrandLogoProps) => {
  const mark = (
    <Image
      src="/logo.svg"
      alt={markOnly ? "Instanet" : ""}
      width={32}
      height={32}
      className={cn("size-8 shrink-0 rounded-lg", markClassName)}
      aria-hidden={!markOnly}
      priority={priority}
    />
  );

  if (markOnly) {
    if (!href) return mark;
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        aria-label="Instanet"
      >
        {mark}
      </Link>
    );
  }

  const content = (
    <>
      {mark}
      <div className="grid min-w-0 flex-1 text-start text-sm leading-tight">
        <span className="truncate font-semibold text-foreground">Instanet</span>
        {showTagline ? (
          <span className="truncate text-xs text-muted-foreground">
            Affiliate
          </span>
        ) : null}
      </div>
    </>
  );

  if (!href) {
    return (
      <div className={cn("inline-flex items-center gap-3", className)}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      aria-label="Instanet Affiliate"
    >
      {content}
    </Link>
  );
};
