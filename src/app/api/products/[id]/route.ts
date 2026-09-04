import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import type { UpdateProductPayload } from "@/features/products/application/services/productApplicationService";
import { ProductError } from "@/features/products/domain";
import { requireAdminActor, requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

const parseProductId = (raw: string) => {
  const productId = Number(raw);
  if (!productId || Number.isNaN(productId)) {
    throw new ProductError("Valid product id is required", "PRODUCT_INVALID_ID");
  }
  return productId;
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireDashboardActor();
    const { id } = await context.params;
    const productId = parseProductId(id);
    const product = await productApplicationService.getProductById(productId);
    return NextResponse.json(product);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminActor();
    const { id } = await context.params;
    const productId = parseProductId(id);
    const payload = (await req.json()) as UpdateProductPayload;
    await productApplicationService.updateProductWithRelations(productId, payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
