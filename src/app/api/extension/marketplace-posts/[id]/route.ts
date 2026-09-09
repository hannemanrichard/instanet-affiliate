import { NextRequest, NextResponse } from "next/server";
import { marketplacePostApplicationService } from "@/features/marketplace-posts/application/services/marketplacePostApplicationService";
import { updateMarketplacePostExtensionBodySchema } from "@/features/marketplace-posts/domain";
import { verifyMarketplaceAttemptToken } from "@/features/marketplace-posts/server/attemptToken";
import { jsonError } from "@/shared/server/jsonError";
import {
  parseJsonBody,
  parsePositiveIntParam,
  ValidationError,
} from "@/shared/server/parseRequest";
import { consumeRateLimit } from "@/shared/server/rateLimit";
import { UnauthorizedError } from "@/shared/server/requireCurrentPartner";

const getBearerToken = (req: NextRequest) => {
  const header = req.headers.get("authorization")?.trim();
  if (!header) return null;
  const [scheme, token] = header.split(/\s+/);
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
};

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = parsePositiveIntParam(idParam, "id");
    const token = getBearerToken(req);
    if (!token) {
      throw new UnauthorizedError("Missing marketplace attempt token");
    }

    let partnerId: number;
    try {
      const payload = verifyMarketplaceAttemptToken(token, id);
      partnerId = payload.partnerId;
    } catch (error) {
      throw new ValidationError(
        error instanceof Error ? error.message : "Invalid attempt token"
      );
    }

    const rateLimit = consumeRateLimit({
      bucket: "marketplace-extension-update",
      identifier: `${partnerId}:${id}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await parseJsonBody(req, updateMarketplacePostExtensionBodySchema);
    const existing = await marketplacePostApplicationService.getById(id);
    if (!existing || existing.partner_id !== partnerId) {
      throw new UnauthorizedError("Attempt does not belong to this affiliate");
    }

    const post = await marketplacePostApplicationService.updateFromExtension(id, {
      status: body.status,
      location: body.location,
      marketplace_post_url: body.marketplace_post_url,
      extension_version: body.extension_version,
      error_message: body.error_message,
      metadata: body.metadata,
    });

    return NextResponse.json({ post });
  } catch (error) {
    return jsonError(error);
  }
}
