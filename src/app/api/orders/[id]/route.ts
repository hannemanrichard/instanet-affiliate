import { NextRequest, NextResponse } from "next/server";
import { orderApplicationService } from "@/features/orders/application/services/orderApplicationService";
import type { UpdateOrderPayload } from "@/features/orders/application/services/orderApplicationService";
import {
  OrderError,
  sanitizePartnerOrderUpdate,
  updateOrderBodySchema,
} from "@/features/orders/domain";
import { requireOrderAccess } from "@/shared/server/requireOrderAccess";
import { jsonError } from "@/shared/server/jsonError";
import {
  parseJsonBody,
  parsePositiveIntParam,
} from "@/shared/server/parseRequest";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const orderId = parsePositiveIntParam(idParam, "id");
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
    const orderId = parsePositiveIntParam(idParam, "id");
    await requireOrderAccess(orderId);

    const body = await parseJsonBody(req, updateOrderBodySchema);

    // Partners cannot change fulfillment / earnings status fields.
    if (body.status != null) {
      throw new OrderError(
        "Order status cannot be updated by partners",
        "ORDER_STATUS_FORBIDDEN"
      );
    }

    const sanitizedOrder = body.order
      ? sanitizePartnerOrderUpdate(body.order)
      : undefined;

    if (body.order && sanitizedOrder && Object.keys(sanitizedOrder).length === 0) {
      throw new OrderError(
        "No partner-writable order fields were provided",
        "ORDER_UPDATE_FORBIDDEN_FIELDS"
      );
    }

    const payload: UpdateOrderPayload = {
      order: sanitizedOrder,
      items: body.items,
    };

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
    const orderId = parsePositiveIntParam(idParam, "id");
    await requireOrderAccess(orderId);
    await orderApplicationService.deleteOrder(orderId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
