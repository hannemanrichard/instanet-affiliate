import { NextResponse } from "next/server";
import { earningsApplicationService } from "@/features/earnings/application/services/earningsApplicationService";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function GET() {
  try {
    const actor = await requireDashboardActor();
    const summary = await earningsApplicationService.getEarningsSummary(
      actor.role === "partner" ? actor.partner.id : undefined
    );
    return NextResponse.json(summary);
  } catch (error) {
    return jsonError(error);
  }
}
