import { NextRequest, NextResponse } from "next/server";
import { inventoryApplicationService } from "@/features/inventory/application/services/inventoryApplicationService";
import { inventoryAdjustmentsBodySchema } from "@/features/inventory/domain/validations";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import {
  parseJsonBody,
  parsePositiveIntParam,
} from "@/shared/server/parseRequest";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    await requireAdminActor();
    const { productId: productIdParam } = await context.params;
    const productId = parsePositiveIntParam(productIdParam, "productId");
    const body = await parseJsonBody(req, inventoryAdjustmentsBodySchema);

    const summary =
      await inventoryApplicationService.bulkAdjustProductInventory(
        productId,
        body.adjustments
      );

    return NextResponse.json({ summary });
  } catch (error) {
    return jsonError(error);
  }
}
