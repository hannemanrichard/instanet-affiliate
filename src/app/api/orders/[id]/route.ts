import { NextRequest, NextResponse } from "next/server";
import { orderApplicationService } from "@/features/orders/application/services/orderApplicationService";
import type { UpdateOrderPayload } from "@/features/orders/application/services/orderApplicationService";
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

    const { detail } = await requireOrderAccess(orderId);
    return NextResponse.json(detail);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
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

    const body = (await req.json()) as UpdateOrderPayload & {
      status?: string;
    };

    if (body.status && !body.order) {
      const order = await orderApplicationService.updateOrderStatus(
        orderId,
        body.status
      );
      return NextResponse.json({ order });
    }

    const payload: UpdateOrderPayload = {
      order: body.order,
      items: body.items,
    };

    if (body.status && payload.order) {
      payload.order = { ...payload.order, status: body.status };
    } else if (body.status) {
      payload.order = { status: body.status };
    }

    if (!payload.order && !payload.items) {
      throw new OrderError(
        "Order update payload is required",
        "ORDER_UPDATE_REQUIRED"
      );
    }

    const result = await orderApplicationService.updateOrder(orderId, payload);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
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
    await orderApplicationService.deleteOrder(orderId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
