import { NextRequest, NextResponse } from "next/server";
import { earningsApplicationService } from "@/features/earnings/application/services/earningsApplicationService";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import { parseSearchParams } from "@/shared/server/parseRequest";
import { z } from "zod";

const affiliateWithdrawsQuerySchema = z.object({
  partnerId: z.coerce.number().int().positive(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdminActor();

    const query = parseSearchParams(
      req.nextUrl.searchParams,
      affiliateWithdrawsQuerySchema
    );

    const summary = await earningsApplicationService.getEarningsSummary(query.partnerId);

    return NextResponse.json({ withdraws: summary.withdraws });
  } catch (error) {
    return jsonError(error);
  }
}
