import { NextRequest, NextResponse } from "next/server";
import { orderApplicationService } from "@/features/orders/application/services/orderApplicationService";
import type { CreateOrderPayload } from "@/features/orders/application/services/orderApplicationService";
import type { CreateOrderInput } from "@/features/orders/domain";
import { requireCurrentPartner } from "@/shared/server/requireCurrentPartner";
import { jsonError } from "@/shared/server/jsonError";

export async function GET(req: NextRequest) {
  try {
    const partner = await requireCurrentPartner();
    const { searchParams } = req.nextUrl;

    const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") ?? "10") || 10));
    const status = searchParams.get("status")?.trim() || undefined;
    const search = searchParams.get("search")?.trim() || undefined;

    const result = await orderApplicationService.getPaginatedOrders(
      {
        partnerId: partner.id,
        status,
        search,
      },
      { page, limit }
    );

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const partner = await requireCurrentPartner();
    const body = (await req.json()) as {
      order?: Partial<CreateOrderInput>;
      items?: CreateOrderPayload["items"];
      productId?: number;
      deliveryLocation?: CreateOrderPayload["deliveryLocation"];
      discount?: number;
    };

    if (!body.order) {
      return NextResponse.json({ error: "Order payload is required" }, { status: 400 });
    }

    // Ignore any client-supplied partner_id — always use session partner
    const orderFields = { ...body.order };
    delete orderFields.partner_id;

    const payload: CreateOrderPayload = {
      order: {
        ...(orderFields as CreateOrderInput),
        partner_id: partner.id,
        product_qty: Number(orderFields.product_qty) || 1,
        is_auto_delivered: orderFields.is_auto_delivered ?? false,
        is_exchange_required: orderFields.is_exchange_required ?? false,
        has_defect: orderFields.has_defect ?? false,
        return_processed: orderFields.return_processed ?? false,
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
