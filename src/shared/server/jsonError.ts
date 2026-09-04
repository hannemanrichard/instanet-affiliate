import { NextResponse } from "next/server";
import { PartnerError } from "@/features/partners/domain";
import { OrderError, OrderItemError } from "@/features/orders/domain";
import { EarningsError } from "@/features/earnings/domain";
import { InventoryError } from "@/features/inventory/domain";
import {
  LeadError,
  LeadHopError,
  LeadItemError,
} from "@/features/leads/domain";
import {
  ProductError,
  ProductItemError,
  ProductPageError,
} from "@/features/products/domain";
import { UnauthorizedError } from "./requireCurrentPartner";

export const jsonError = (error: unknown, fallbackStatus = 500) => {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (
    error instanceof PartnerError ||
    error instanceof OrderError ||
    error instanceof OrderItemError ||
    error instanceof EarningsError ||
    error instanceof InventoryError ||
    error instanceof LeadError ||
    error instanceof LeadItemError ||
    error instanceof LeadHopError ||
    error instanceof ProductError ||
    error instanceof ProductItemError ||
    error instanceof ProductPageError
  ) {
    const status =
      error.code.includes("REQUIRED") || error.code.includes("INVALID")
        ? 400
        : error.code.includes("EXCEEDS")
          ? 400
          : error.code.includes("NOT_FOUND")
            ? 404
            : error.code.includes("NOT_ALLOWED")
              ? 403
              : 500;

    return NextResponse.json(
      { error: error.message, code: error.code },
      { status }
    );
  }

  return NextResponse.json(
    { error: "Internal server error" },
    { status: fallbackStatus }
  );
};
