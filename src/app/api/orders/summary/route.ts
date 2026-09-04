import { NextResponse } from "next/server";
import { orderApplicationService } from "@/features/orders/application/services/orderApplicationService";
import { requireCurrentPartner } from "@/shared/server/requireCurrentPartner";
import { jsonError } from "@/shared/server/jsonError";

export async function GET() {
  try {
    const partner = await requireCurrentPartner();
    const summary = await orderApplicationService.getOrderSummary(partner.id);
    return NextResponse.json(summary);
  } catch (error) {
    return jsonError(error);
  }
}
