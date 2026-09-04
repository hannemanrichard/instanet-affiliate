"use client";

import { AppIcon } from "@/shared/components/layout/AppIcon";
import { uiIcons } from "@/shared/components/layout/navIcons";
import type { OrderEntity } from "../domain";

type OrderContactCellProps = {
  order: OrderEntity;
  callAria: string;
};

export const OrderContactCell = ({
  order,
  callAria,
}: OrderContactCellProps) => {
  const phone = order.phone?.trim();

  if (!phone) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <a
      href={`tel:${phone}`}
      className="inline-flex min-w-0 items-center gap-2 text-sm tabular-nums text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={callAria}
    >
      <AppIcon icon={uiIcons.phone} size={16} className="text-muted-foreground" />
      <span className="truncate">{phone}</span>
    </a>
  );
};
