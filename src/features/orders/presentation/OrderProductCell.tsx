"use client";

import { Package } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import type { OrderEntity } from "../domain";

type OrderProductCellProps = {
  order: OrderEntity;
};

export const OrderProductCell = ({ order }: OrderProductCellProps) => {
  const qty = order.product_qty ?? 1;
  const thumbnail = order.product_thumbnail;
  const label = order.product?.trim() || "Product";

  return (
    <div
      className="relative size-12 shrink-0"
      title={label}
      aria-label={`${label}, quantity ${qty}`}
    >
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt=""
          className="size-12 rounded-full object-cover ring-1 ring-border"
        />
      ) : (
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-full bg-muted ring-1 ring-border"
          )}
        >
          <Package className="size-5 text-muted-foreground" aria-hidden />
        </div>
      )}
      <span
        className="absolute -bottom-0.5 -end-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold leading-none tabular-nums text-primary-foreground ring-2 ring-background"
        aria-hidden
      >
        {qty}
      </span>
    </div>
  );
};
