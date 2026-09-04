import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import { catalogSearchQuerySchema } from "@/features/products/domain/validations";
import { jsonError } from "@/shared/server/jsonError";
import { parseSearchParams } from "@/shared/server/parseRequest";

export async function GET(req: NextRequest) {
  try {
    const query = parseSearchParams(
      req.nextUrl.searchParams,
      catalogSearchQuerySchema
    );
    const pages = await productApplicationService.searchProductPages(query.q);
    return NextResponse.json(pages);
  } catch (error) {
    return jsonError(error);
  }
}
