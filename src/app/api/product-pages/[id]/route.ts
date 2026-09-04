import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import type { ProductPageEntity } from "@/features/products/domain";
import { ProductPageError } from "@/features/products/domain";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

const parsePageId = (raw: string) => {
  const pageId = Number(raw);
  if (!pageId || Number.isNaN(pageId)) {
    throw new ProductPageError(
      "Valid product page id is required",
      "PRODUCT_PAGE_INVALID_ID"
    );
  }
  return pageId;
};

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminActor();
    const { id } = await context.params;
    const pageId = parsePageId(id);
    const payload = (await req.json()) as Partial<ProductPageEntity>;
    const page = await productApplicationService.updateProductPage(pageId, payload);
    return NextResponse.json(page);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminActor();
    const { id } = await context.params;
    const pageId = parsePageId(id);
    await productApplicationService.deleteProductPage(pageId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
