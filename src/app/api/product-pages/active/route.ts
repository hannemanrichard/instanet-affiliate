import { NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import { jsonError } from "@/shared/server/jsonError";

export async function GET() {
  try {
    const pages = await productApplicationService.getActiveProductPages();
    return NextResponse.json(pages);
  } catch (error) {
    return jsonError(error);
  }
}
