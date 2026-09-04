import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import { jsonError } from "@/shared/server/jsonError";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    const catalog = await productApplicationService.getCatalog(q);
    return NextResponse.json(catalog);
  } catch (error) {
    return jsonError(error);
  }
}
