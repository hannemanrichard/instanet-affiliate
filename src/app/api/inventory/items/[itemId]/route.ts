import { NextRequest, NextResponse } from "next/server";
import { inventoryApplicationService } from "@/features/inventory/application/services/inventoryApplicationService";
import { InventoryError } from "@/features/inventory/domain";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    await requireDashboardActor();
    const { itemId: itemIdParam } = await context.params;
    const itemId = Number(itemIdParam);

    if (!itemId || Number.isNaN(itemId)) {
      throw new InventoryError(
        "Valid itemId is required",
        "INVENTORY_INVALID_ITEM"
      );
    }

    const inventory =
      await inventoryApplicationService.getInventoryByItem(itemId);
    return NextResponse.json({ inventory });
  } catch (error) {
    return jsonError(error);
  }
}
