import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import { jsonError } from "@/shared/server/jsonError";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    const pages = await productApplicationService.searchProductPages(q);
    return NextResponse.json(pages);
  } catch (error) {
    return jsonError(error);
  }
}
