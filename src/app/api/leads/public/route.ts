import { NextRequest, NextResponse } from "next/server";
import {
  leadApplicationService,
  type CreateLeadPayload,
} from "@/features/leads/application/services/leadApplicationService";
import { leadHopApplicationService } from "@/features/leads/application/services/leadHopApplicationService";
import type {
  CreateLeadInput,
  CreateLeadItemInput,
  LeadWithItems,
} from "@/features/leads/domain";
import { LeadError } from "@/features/leads/domain";
import { SupabasePartnerService } from "@/features/partners/data";
import { supabaseServer } from "@/infrastructure/supabase/server";
import { jsonError } from "@/shared/server/jsonError";

const ALLOWED_LEAD_FIELDS = [
  "first_name",
  "last_name",
  "phone",
  "address",
  "commune",
  "wilaya",
  "channel",
  "comment",
  "color",
  "size",
  "product",
  "status",
  "objective",
  "offer",
  "price",
  "is_abondoned",
  "is_moved",
  "is_wholesale",
  "has_recourse",
] as const;

type AllowedLeadField = (typeof ALLOWED_LEAD_FIELDS)[number];

const partnerService = new SupabasePartnerService();

const pickAllowedLeadFields = (
  input: Record<string, unknown>
): Partial<CreateLeadInput> => {
  const result: Partial<CreateLeadInput> = {};
  for (const key of ALLOWED_LEAD_FIELDS) {
    if (key in input) {
      (result as Record<AllowedLeadField, unknown>)[key] = input[key];
    }
  }
  return result;
};

const resolvePartnerIdFromRef = async (
  ref: unknown
): Promise<number | undefined> => {
  if (ref == null || ref === "") return undefined;

  const asNumber = Number(ref);
  if (!Number.isNaN(asNumber) && asNumber > 0) {
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

const sanitizeItems = (items: unknown): CreateLeadItemInput[] | undefined => {
  if (!Array.isArray(items) || items.length === 0) return undefined;
  return items
    .map((item) => {
      const raw = item as { item_id?: unknown; qty?: unknown };
      const item_id = Number(raw.item_id);
      const qty = Number(raw.qty);
      if (!item_id || Number.isNaN(item_id) || Number.isNaN(qty) || qty < 1) {
        return null;
      }
      return { item_id, qty };
    })
    .filter((item): item is CreateLeadItemInput => item != null);
};

/**
 * Public storefront lead submit (no Clerk session).
 * Only inserts allowlisted fields; ignores client agent_id / partner_id.
 * Optional `ref` may set partner_id after partner id/username validation.
 * Creates lead_hop when an agent is auto-assigned.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      lead?: Record<string, unknown>;
      items?: unknown;
      ref?: unknown;
    };

    if (!body.lead || typeof body.lead !== "object") {
      throw new LeadError("Lead payload is required", "LEAD_REQUIRED");
    }

    const leadFields = pickAllowedLeadFields(body.lead);
    if (!leadFields.phone && !leadFields.first_name) {
      throw new LeadError(
        "Lead requires at least phone or first_name",
        "LEAD_INVALID"
      );
    }

    const partnerId = await resolvePartnerIdFromRef(body.ref);

    const payload: CreateLeadPayload = {
      lead: {
        ...leadFields,
        status: leadFields.status ?? "initial",
        is_moved: leadFields.is_moved ?? false,
        is_abondoned: leadFields.is_abondoned ?? false,
        is_wholesale: leadFields.is_wholesale ?? false,
        ...(partnerId != null ? { partner_id: partnerId } : {}),
      } as CreateLeadInput,
      items: sanitizeItems(body.items),
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
