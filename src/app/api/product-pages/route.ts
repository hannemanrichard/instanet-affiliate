import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import { createProductPageBodySchema } from "@/features/products/domain/validations";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import { parseJsonBody } from "@/shared/server/parseRequest";

export async function POST(req: NextRequest) {
  try {
    await requireAdminActor();
    const payload = await parseJsonBody(req, createProductPageBodySchema);
    const page = await productApplicationService.createProductPage(payload);
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
