import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import { updateProductWithRelationsBodySchema } from "@/features/products/domain/validations";
import { withAuditActor } from "@/shared/server/auditActorContext";
import { requireAuditActorPartnerId } from "@/shared/server/requireAuditActorPartnerId";
import { requireAdminActor, requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import {
  parseJsonBody,
  parsePositiveIntParam,
} from "@/shared/server/parseRequest";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireDashboardActor();
    const { id } = await context.params;
    const productId = parsePositiveIntParam(id, "id");
    const product = await productApplicationService.getProductById(productId);
    return NextResponse.json(product);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminActor();
    const auditActorId = await requireAuditActorPartnerId();
    const { id } = await context.params;
    const productId = parsePositiveIntParam(id, "id");
    const payload = await parseJsonBody(req, updateProductWithRelationsBodySchema);
    await withAuditActor(auditActorId, () =>
      productApplicationService.updateProductWithRelations(productId, payload)
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
