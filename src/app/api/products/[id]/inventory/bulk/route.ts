import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import { productInventoryAdjustmentsBodySchema } from "@/features/products/domain/validations";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import {
  parseJsonBody,
  parsePositiveIntParam,
} from "@/shared/server/parseRequest";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminActor();
    const { id } = await context.params;
    const productId = parsePositiveIntParam(id, "id");
    const body = await parseJsonBody(req, productInventoryAdjustmentsBodySchema);

    const snapshot = await productApplicationService.bulkUpdateInventory(
      productId,
      body.adjustments
    );
    return NextResponse.json(snapshot);
  } catch (error) {
    return jsonError(error);
  }
}
