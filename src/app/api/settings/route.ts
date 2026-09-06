import { NextRequest, NextResponse } from "next/server";
import { settingsApplicationService } from "@/features/settings/application/services/settingsApplicationService";
import { updateSettingBodySchema } from "@/features/settings/domain/validations";
import { withAuditActor } from "@/shared/server/auditActorContext";
import { requireAuditActorPartnerId } from "@/shared/server/requireAuditActorPartnerId";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import { parseJsonBody } from "@/shared/server/parseRequest";

export async function GET() {
  try {
    await requireAdminActor();
    const settings = await settingsApplicationService.getAllSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminActor();
    const auditActorId = await requireAuditActorPartnerId();
    const body = await parseJsonBody(req, updateSettingBodySchema);

    const setting = await withAuditActor(
      auditActorId,
      () =>
        settingsApplicationService.updateSetting(
          body.key,
          body.value ?? null
        )
    );
    return NextResponse.json(setting);
  } catch (error) {
    return jsonError(error);
  }
}
