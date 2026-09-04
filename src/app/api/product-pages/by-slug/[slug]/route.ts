import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import { jsonError } from "@/shared/server/jsonError";
import { parseWithSchema } from "@/shared/server/parseRequest";
import { z } from "zod";

const slugSchema = z.string().trim().min(1).max(200);

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await context.params;
    const slug = parseWithSchema(slugSchema, rawSlug, "Invalid slug");
    const page = await productApplicationService.getProductPageBySlug(slug);
    return NextResponse.json(page);
  } catch (error) {
    return jsonError(error);
  }
}
