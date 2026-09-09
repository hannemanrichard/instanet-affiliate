import { NextRequest, NextResponse } from "next/server";
import { affiliateClaimApplicationService } from "@/features/claims/application/services/affiliateClaimApplicationService";
import { jsonError } from "@/shared/server/jsonError";
import { parsePositiveIntParam } from "@/shared/server/parseRequest";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { UnauthorizedError } from "@/shared/server/requireCurrentPartner";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireDashboardActor();
    const { id: idParam } = await context.params;
    const id = parsePositiveIntParam(idParam, "id");

    const claim = await affiliateClaimApplicationService.getClaimById(id);
    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    if (actor.role === "partner" && claim.partner_id !== actor.partner.id) {
      throw new UnauthorizedError("You can only view your own claims");
    }

    return NextResponse.json({ claim });
  } catch (error) {
    return jsonError(error);
  }
}
