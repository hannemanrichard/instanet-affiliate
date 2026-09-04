import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import type { ProductInventoryAdjustment } from "@/features/products/domain";
import { ProductError, ProductItemError } from "@/features/products/domain";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminActor();
    const { id } = await context.params;
    const productId = Number(id);

    if (!productId || Number.isNaN(productId)) {
      throw new ProductError("Valid product id is required", "PRODUCT_INVALID_ID");
    }

    const body = (await req.json()) as {
      adjustments?: ProductInventoryAdjustment[];
    };

    if (!body.adjustments?.length) {
      throw new ProductItemError(
        "adjustments are required",
        "PRODUCT_INVENTORY_ADJUSTMENTS_REQUIRED"
      );
    }

    const snapshot = await productApplicationService.bulkUpdateInventory(
      productId,
      body.adjustments
    );
    return NextResponse.json(snapshot);
  } catch (error) {
    return jsonError(error);
  }
}
