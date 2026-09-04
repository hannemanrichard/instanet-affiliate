import { NextRequest, NextResponse } from "next/server";
import { inventoryApplicationService } from "@/features/inventory/application/services/inventoryApplicationService";
import { updateInventoryQuantityBodySchema } from "@/features/inventory/domain/validations";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import {
  parseJsonBody,
  parsePositiveIntParam,
} from "@/shared/server/parseRequest";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminActor();
    const { id: idParam } = await context.params;
    const inventoryId = parsePositiveIntParam(idParam, "id");
    const body = await parseJsonBody(req, updateInventoryQuantityBodySchema);

    const inventory = await inventoryApplicationService.updateInventoryQuantity(
      inventoryId,
      body.quantity
    );

    return NextResponse.json({ inventory });
  } catch (error) {
    return jsonError(error);
  }
}
