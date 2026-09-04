import { NextResponse } from "next/server";
import { settingsApplicationService } from "@/features/settings/application/services/settingsApplicationService";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function GET() {
  try {
    await requireAdminActor();
    const settings = await settingsApplicationService.getAnalyticsSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return jsonError(error);
  }
}
