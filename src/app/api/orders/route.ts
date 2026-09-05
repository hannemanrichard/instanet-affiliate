import { NextRequest, NextResponse } from "next/server";
import { orderApplicationService } from "@/features/orders/application/services/orderApplicationService";
import type { CreateOrderPayload } from "@/features/orders/application/services/orderApplicationService";
import type { CreateOrderInput } from "@/features/orders/domain";
import {
  createOrderBodySchema,
  listOrdersQuerySchema,
  sanitizePartnerOrderCreate,
} from "@/features/orders/domain";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import {
  parseJsonBody,
  parseSearchParams,
} from "@/shared/server/parseRequest";

export async function GET(req: NextRequest) {
  try {
    const actor = await requireDashboardActor();
    const query = parseSearchParams(
      req.nextUrl.searchParams,
      listOrdersQuerySchema
    );

    const result = await orderApplicationService.getPaginatedOrders(
      {
        partnerId: actor.role === "partner" ? actor.partner.id : undefined,
        status: query.status,
        search: query.search,
      },
      { page: query.page, limit: query.limit }
    );

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireDashboardActor();
    if (actor.role !== "partner") {
      return NextResponse.json(
        { error: "Admins cannot create affiliate orders" },
        { status: 403 }
      );
    }
    const body = await parseJsonBody(req, createOrderBodySchema);

    // Drop status / dc_recent_status / partner_id / tracking / etc.
    const orderFields = sanitizePartnerOrderCreate(body.order);

    const payload: CreateOrderPayload = {
      order: {
        ...(orderFields as CreateOrderInput),
        partner_id: actor.partner.id,
        // Always start as initial — partners cannot create delivered/encaissé orders
        status: "initial",
        product_qty: Number(orderFields.product_qty) || 1,
        is_auto_delivered: false,
        is_exchange_required: orderFields.is_exchange_required ?? false,
        has_defect: orderFields.has_defect ?? false,
        return_processed: false,
      },
      items: body.items,
      auditActorId: actor.partner.id,
      productId: body.productId,
      deliveryLocation: body.deliveryLocation,
      discount:
        body.discount != null && Number.isFinite(body.discount) && body.discount > 0
          ? body.discount
          : undefined,
    };

    const result = await orderApplicationService.createOrder(payload);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
