import { NextRequest, NextResponse } from "next/server";
import { orderApplicationService } from "@/features/orders/application/services/orderApplicationService";
import { replaceOrderItemsBodySchema } from "@/features/orders/domain";
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
    const orderId = parsePositiveIntParam(idParam, "id");
    const { actor } = await requireOrderAccess(orderId);

    const body = await parseJsonBody(req, replaceOrderItemsBodySchema);
    const items = await orderApplicationService.replaceOrderItems(
      orderId,
      body.items,
      actor.role === "partner" ? actor.partner.id : undefined
    );
    return NextResponse.json({ items });
  } catch (error) {
    return jsonError(error);
  }
}
