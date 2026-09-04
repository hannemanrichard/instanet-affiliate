import { NextRequest, NextResponse } from "next/server";
import { inventoryApplicationService } from "@/features/inventory/application/services/inventoryApplicationService";
import { InventoryError } from "@/features/inventory/domain";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminActor();
    const { id: idParam } = await context.params;
    const inventoryId = Number(idParam);

    if (!inventoryId || Number.isNaN(inventoryId)) {
      throw new InventoryError(
        "Valid inventory id is required",
        "INVENTORY_INVALID_ID"
      );
    }

    const body = (await req.json()) as { quantity?: number };

    if (body.quantity == null || Number.isNaN(Number(body.quantity))) {
      throw new InventoryError(
        "quantity is required",
        "INVENTORY_QUANTITY_REQUIRED"
      );
    }

    const inventory = await inventoryApplicationService.updateInventoryQuantity(
      inventoryId,
      Number(body.quantity)
    );

    return NextResponse.json({ inventory });
  } catch (error) {
    return jsonError(error);
  }
}
