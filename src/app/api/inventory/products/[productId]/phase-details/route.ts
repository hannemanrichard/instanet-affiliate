import { NextRequest, NextResponse } from "next/server";
import { inventoryApplicationService } from "@/features/inventory/application/services/inventoryApplicationService";
import { inventoryPhaseDetailsQuerySchema } from "@/features/inventory/domain/validations";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import {
  parsePositiveIntParam,
  parseSearchParams,
} from "@/shared/server/parseRequest";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    await requireDashboardActor();
    const { productId: productIdParam } = await context.params;
    const productId = parsePositiveIntParam(productIdParam, "productId");
    const query = parseSearchParams(
      req.nextUrl.searchParams,
      inventoryPhaseDetailsQuerySchema
    );

    const details = await inventoryApplicationService.getInventoryPhaseDetails(
      productId,
      { phases: query.phases, productName: query.productName }
    );

    return NextResponse.json({ details });
  } catch (error) {
    return jsonError(error);
  }
}
