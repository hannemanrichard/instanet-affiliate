import { NextRequest, NextResponse } from "next/server";
import { settingsApplicationService } from "@/features/settings/application/services/settingsApplicationService";
import type { SettingKey } from "@/features/settings/domain";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

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
    const body = (await req.json()) as {
      key?: SettingKey | string;
      value?: string | null;
    };

    if (!body.key || typeof body.key !== "string" || !body.key.trim()) {
      return NextResponse.json(
        { error: "Setting key is required", code: "SETTING_KEY_REQUIRED" },
        { status: 400 }
      );
    }

    const setting = await settingsApplicationService.updateSetting(
      body.key.trim(),
      body.value ?? null
    );
    return NextResponse.json(setting);
  } catch (error) {
    return jsonError(error);
  }
}
