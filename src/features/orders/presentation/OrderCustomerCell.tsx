"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { getDicebearAvatarUrl } from "@/shared/utils/dicebear";
import type { OrderEntity } from "../domain";
import {
  getOrderCustomerName,
  getOrderLocationLabel,
} from "./orderTableUtils";

type OrderCustomerCellProps = {
  order: OrderEntity;
};

export const OrderCustomerCell = ({ order }: OrderCustomerCellProps) => {
  const fullName = getOrderCustomerName(order);
  const location = getOrderLocationLabel(order);
  const avatarSeed =
    fullName !== "—" ? fullName : order.phone?.trim() || String(order.id);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-10 shrink-0">
        <AvatarImage src={getDicebearAvatarUrl(avatarSeed)} alt={fullName} />
        <AvatarFallback className="text-xs font-semibold">
          {fullName !== "—"
            ? fullName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium leading-tight">{fullName}</span>
        <span className="truncate text-xs text-muted-foreground">
          {location}
        </span>
      </div>
    </div>
  );
};
