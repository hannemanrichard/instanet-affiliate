import { NextRequest, NextResponse } from "next/server";
import { orderApplicationService } from "@/features/orders/application/services/orderApplicationService";
import type { CreateOrderPayload } from "@/features/orders/application/services/orderApplicationService";
import type { CreateOrderInput } from "@/features/orders/domain";
import {
  createOrderBodySchema,
  listOrdersQuerySchema,
  sanitizePartnerOrderCreate,
} from "@/features/orders/domain";
import { requireCurrentPartner } from "@/shared/server/requireCurrentPartner";
import { jsonError } from "@/shared/server/jsonError";
import {
  parseJsonBody,
  parseSearchParams,
} from "@/shared/server/parseRequest";

export async function GET(req: NextRequest) {
  try {
    const partner = await requireCurrentPartner();
    const query = parseSearchParams(
      req.nextUrl.searchParams,
      listOrdersQuerySchema
    );

    const result = await orderApplicationService.getPaginatedOrders(
      {
        partnerId: partner.id,
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
    const partner = await requireCurrentPartner();
    const body = await parseJsonBody(req, createOrderBodySchema);

    // Drop status / dc_recent_status / partner_id / tracking / etc.
    const orderFields = sanitizePartnerOrderCreate(body.order);

    const payload: CreateOrderPayload = {
      order: {
        ...(orderFields as CreateOrderInput),
        partner_id: partner.id,
        // Always start as initial — partners cannot create delivered/encaissé orders
        status: "initial",
        product_qty: Number(orderFields.product_qty) || 1,
        is_auto_delivered: false,
        is_exchange_required: orderFields.is_exchange_required ?? false,
        has_defect: orderFields.has_defect ?? false,
        return_processed: false,
      },
      items: body.items,
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
