import { NextRequest, NextResponse } from "next/server";
import { inventoryApplicationService } from "@/features/inventory/application/services/inventoryApplicationService";
import type { InventoryAdjustmentInput } from "@/features/inventory/domain";
import { InventoryError } from "@/features/inventory/domain";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    await requireAdminActor();
    const { productId: productIdParam } = await context.params;
    const productId = Number(productIdParam);

    if (!productId || Number.isNaN(productId)) {
      throw new InventoryError(
        "Valid productId is required",
        "INVENTORY_INVALID_PRODUCT"
      );
    }

    const body = (await req.json()) as {
      adjustments?: InventoryAdjustmentInput[];
    };

    if (!body.adjustments?.length) {
      throw new InventoryError(
        "adjustments are required",
        "INVENTORY_ADJUSTMENTS_REQUIRED"
      );
    }

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
