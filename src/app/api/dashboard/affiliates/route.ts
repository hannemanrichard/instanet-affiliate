import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { partnerApplicationService } from "@/features/partners/application/services/partnerApplicationService";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import { parseSearchParams } from "@/shared/server/parseRequest";

const affiliatesQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdminActor();
    const query = parseSearchParams(req.nextUrl.searchParams, affiliatesQuerySchema);
    const affiliates = await partnerApplicationService.listAll(query.search);
    return NextResponse.json({ affiliates });
  } catch (error) {
    return jsonError(error);
  }
}
