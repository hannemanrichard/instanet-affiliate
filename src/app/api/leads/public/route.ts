import { NextRequest, NextResponse } from "next/server";
import {
  leadApplicationService,
  type CreateLeadPayload,
} from "@/features/leads/application/services/leadApplicationService";
import { leadHopApplicationService } from "@/features/leads/application/services/leadHopApplicationService";
import type { CreateLeadInput, LeadWithItems } from "@/features/leads/domain";
import { publicLeadBodySchema } from "@/features/leads/domain";
import { SupabasePartnerService } from "@/features/partners/data";
import { supabaseServer } from "@/infrastructure/supabase/server";
import { jsonError } from "@/shared/server/jsonError";
import { parseJsonBody } from "@/shared/server/parseRequest";

const partnerService = new SupabasePartnerService();

const resolvePartnerIdFromRef = async (
  ref: string | number | undefined
): Promise<number | undefined> => {
  if (ref == null || ref === "") return undefined;

  const asNumber = typeof ref === "number" ? ref : Number(ref);
  if (!Number.isNaN(asNumber) && asNumber > 0 && String(ref).trim() === String(asNumber)) {
    const partner = await partnerService.getById(asNumber);
    return partner?.id;
  }

  if (typeof ref !== "string") return undefined;
  const username = ref.trim();
  if (!username) return undefined;

  const { data, error } = await supabaseServer
    .from("partners")
    .select("id")
    .ilike("username", username)
    .maybeSingle();

  if (error || !data) return undefined;
  return data.id;
};

/**
 * Public storefront lead submit (no Clerk session).
 * Only inserts allowlisted fields; ignores client agent_id / partner_id.
 * Optional `ref` may set partner_id after partner id/username validation.
 * Creates lead_hop when an agent is auto-assigned.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await parseJsonBody(req, publicLeadBodySchema);
    const partnerId = await resolvePartnerIdFromRef(body.ref);

    const payload: CreateLeadPayload = {
      lead: {
        ...body.lead,
        status: body.lead.status ?? "initial",
        is_moved: body.lead.is_moved ?? false,
        is_abondoned: body.lead.is_abondoned ?? false,
        is_wholesale: body.lead.is_wholesale ?? false,
        ...(partnerId != null ? { partner_id: partnerId } : {}),
      } as CreateLeadInput,
      items: body.items,
    };

    const result: LeadWithItems =
      await leadApplicationService.createLead(payload);

    if (result.lead.agent_id) {
      try {
        await leadHopApplicationService.createLeadHop({
          lead_id: result.lead.id,
          agent_id: result.lead.agent_id,
        });
      } catch {
        // Hop may already exist; lead create still succeeded
      }
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
