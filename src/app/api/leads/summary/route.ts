import { NextResponse } from "next/server";
import { leadApplicationService } from "@/features/leads/application/services/leadApplicationService";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function GET() {
  try {
    const actor = await requireDashboardActor();
    const partnerId =
      actor.role === "partner" ? actor.partner.id : undefined;
    const summary = await leadApplicationService.getLeadSummary(partnerId);
    return NextResponse.json(summary);
  } catch (error) {
    return jsonError(error);
  }
}
