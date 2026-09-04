import { NextRequest, NextResponse } from "next/server";
import { inventoryApplicationService } from "@/features/inventory/application/services/inventoryApplicationService";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import { parsePositiveIntParam } from "@/shared/server/parseRequest";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    await requireDashboardActor();
    const { productId: productIdParam } = await context.params;
    const productId = parsePositiveIntParam(productIdParam, "productId");

    const summary =
      await inventoryApplicationService.getInventoryPhaseSummary(productId);
    return NextResponse.json({ summary });
  } catch (error) {
    return jsonError(error);
  }
}
