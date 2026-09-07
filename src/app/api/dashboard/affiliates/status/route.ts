import { NextRequest, NextResponse } from "next/server";
import { partnerApplicationService } from "@/features/partners/application/services/partnerApplicationService";
import { updatePartnerStatusBodySchema } from "@/features/partners/domain";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import { parseJsonBody, parseSearchParams } from "@/shared/server/parseRequest";
import { z } from "zod";

const partnerStatusQuerySchema = z.object({
  partnerId: z.coerce.number().int().positive(),
});

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminActor();

    const query = parseSearchParams(req.nextUrl.searchParams, partnerStatusQuerySchema);
    const body = await parseJsonBody(
      req,
      updatePartnerStatusBodySchema,
      "Invalid partner status update"
    );

    const partner = await partnerApplicationService.updateStatus(query.partnerId, body);

    return NextResponse.json({ partner });
  } catch (error) {
    return jsonError(error);
  }
}
