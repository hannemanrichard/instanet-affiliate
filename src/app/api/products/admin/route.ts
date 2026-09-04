import { NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function GET() {
  try {
    await requireDashboardActor();
    const products = await productApplicationService.getAdminProducts();
    return NextResponse.json(products);
  } catch (error) {
    return jsonError(error);
  }
}
