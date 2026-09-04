import { NextResponse } from "next/server";
import { requireCurrentPartner } from "@/shared/server/requireCurrentPartner";
import { jsonError } from "@/shared/server/jsonError";

export async function GET() {
  try {
    const partner = await requireCurrentPartner();
    return NextResponse.json({ partner });
  } catch (error) {
    return jsonError(error);
  }
}
