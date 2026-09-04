import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import { parsePositiveIntParam } from "@/shared/server/parseRequest";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireDashboardActor();
    const { id } = await context.params;
    const productId = parsePositiveIntParam(id, "id");
    const items = await productApplicationService.getProductItems(productId);
    return NextResponse.json(items);
  } catch (error) {
    return jsonError(error);
  }
}
