import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import { jsonError } from "@/shared/server/jsonError";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const page = await productApplicationService.getProductPageBySlug(slug);
    return NextResponse.json(page);
  } catch (error) {
    return jsonError(error);
  }
}
