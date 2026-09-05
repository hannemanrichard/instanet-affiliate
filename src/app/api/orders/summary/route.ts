import { NextResponse } from "next/server";
import { orderApplicationService } from "@/features/orders/application/services/orderApplicationService";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function GET() {
  try {
    const actor = await requireDashboardActor();
    const summary = await orderApplicationService.getOrderSummary(
      actor.role === "partner" ? actor.partner.id : undefined
    );
    return NextResponse.json(summary);
  } catch (error) {
    return jsonError(error);
  }
}
