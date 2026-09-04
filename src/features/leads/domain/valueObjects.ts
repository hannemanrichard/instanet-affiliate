export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost"
  | string;

export interface LeadFilters {
  status?: LeadStatus;
  search?: string;
  agentId?: number;
  partnerId?: number;
}

