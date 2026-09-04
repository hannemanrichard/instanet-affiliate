import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import { ProductError } from "@/features/products/domain";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireDashboardActor();
    const { id } = await context.params;
    const productId = Number(id);

    if (!productId || Number.isNaN(productId)) {
      throw new ProductError("Valid product id is required", "PRODUCT_INVALID_ID");
    }

    const inventory =
      await productApplicationService.getProductInventory(productId);
    return NextResponse.json(inventory);
  } catch (error) {
    return jsonError(error);
  }
}
