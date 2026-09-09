import { NextRequest, NextResponse } from "next/server";
import { affiliateClaimApplicationService } from "@/features/claims/application/services/affiliateClaimApplicationService";
import {
  createAffiliateClaimBodySchema,
  listAffiliateClaimsQuerySchema,
} from "@/features/claims/domain";
import { withAuditActor } from "@/shared/server/auditActorContext";
import { jsonError } from "@/shared/server/jsonError";
import {
  parseJsonBody,
  parseSearchParams,
} from "@/shared/server/parseRequest";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { UnauthorizedError } from "@/shared/server/requireCurrentPartner";

export async function GET(req: NextRequest) {
  try {
    const actor = await requireDashboardActor();
    const query = parseSearchParams(
      req.nextUrl.searchParams,
      listAffiliateClaimsQuerySchema
    );

    const result = await affiliateClaimApplicationService.listClaims(
      {
        partnerId: actor.role === "partner" ? actor.partner.id : undefined,
        status: query.status,
      },
      { page: query.page, limit: query.limit }
    );

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireDashboardActor();
    if (actor.role !== "partner") {
      throw new UnauthorizedError("Only affiliates can create claims");
    }

    const body = await parseJsonBody(req, createAffiliateClaimBodySchema);
    const claim = await withAuditActor(actor.partner.id, () =>
      affiliateClaimApplicationService.createClaim({
        partner_id: actor.partner.id,
        order_id: body.order_id,
        category: body.category,
        title: body.title,
        description: body.description,
        attachments: body.attachments,
      })
    );

    return NextResponse.json(claim, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
