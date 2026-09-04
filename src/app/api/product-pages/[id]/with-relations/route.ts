import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import type { UpdateProductPagePayload } from "@/features/products/application/services/productApplicationService";
import { ProductPageError } from "@/features/products/domain";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminActor();
    const { id } = await context.params;
    const pageId = Number(id);

    if (!pageId || Number.isNaN(pageId)) {
      throw new ProductPageError(
        "Valid product page id is required",
        "PRODUCT_PAGE_INVALID_ID"
      );
    }

    const payload = (await req.json()) as UpdateProductPagePayload;
    const page = await productApplicationService.updateProductPageWithRelations(
      pageId,
      payload
    );
    return NextResponse.json(page);
  } catch (error) {
    return jsonError(error);
  }
}
