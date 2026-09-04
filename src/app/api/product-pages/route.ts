import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import type { CreateProductPagePayload } from "@/features/products/application/services/productApplicationService";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function POST(req: NextRequest) {
  try {
    await requireAdminActor();
    const payload = (await req.json()) as CreateProductPagePayload;
    const page = await productApplicationService.createProductPage(payload);
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
