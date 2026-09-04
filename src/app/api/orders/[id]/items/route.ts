import { NextRequest, NextResponse } from "next/server";
import { orderApplicationService } from "@/features/orders/application/services/orderApplicationService";
import type { UpdateOrderItemInput } from "@/features/orders/domain";
import { OrderError } from "@/features/orders/domain";
import { requireOrderAccess } from "@/shared/server/requireOrderAccess";
import { jsonError } from "@/shared/server/jsonError";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const orderId = Number(idParam);
    if (!orderId || Number.isNaN(orderId)) {
      throw new OrderError("Valid order id is required", "ORDER_INVALID_ID");
    }

    await requireOrderAccess(orderId);
    const items = await orderApplicationService.getOrderItems(orderId);
    return NextResponse.json({ items });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const orderId = Number(idParam);
    if (!orderId || Number.isNaN(orderId)) {
      throw new OrderError("Valid order id is required", "ORDER_INVALID_ID");
    }

    await requireOrderAccess(orderId);

    const body = (await req.json()) as { items?: UpdateOrderItemInput[] };
    if (!body.items) {
      throw new OrderError(
        "Order items payload is required",
        "ORDER_ITEMS_REQUIRED"
      );
    }

    const items = await orderApplicationService.replaceOrderItems(
      orderId,
      body.items
    );
    return NextResponse.json({ items });
  } catch (error) {
    return jsonError(error);
  }
}
