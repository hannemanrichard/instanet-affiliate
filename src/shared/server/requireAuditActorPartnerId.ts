import { requireCurrentPartner } from "./requireCurrentPartner";

export const requireAuditActorPartnerId = async (): Promise<number> => {
  const partner = await requireCurrentPartner();
  return partner.id;
};
