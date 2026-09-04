import { leadApplicationService } from "@/features/leads/application/services/leadApplicationService";
import type { LeadWithItems } from "@/features/leads/domain";
import { LeadError } from "@/features/leads/domain";
import {
  requireDashboardActor,
  type DashboardActor,
} from "@/shared/server/requireDashboardActor";

/**
 * Ensures the caller may access the lead.
 * Partners only see their own; admins see all.
 */
export const requireLeadAccess = async (
  leadId: number
): Promise<{ actor: DashboardActor; detail: LeadWithItems }> => {
  const actor = await requireDashboardActor();
  const detail = await leadApplicationService.getLeadDetail(leadId);

  if (
    actor.role === "partner" &&
    detail.lead.partner_id !== actor.partner.id
  ) {
    throw new LeadError("Lead not found", "LEAD_NOT_FOUND");
  }

  return { actor, detail };
};
