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

export interface LeadPaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedLeadsResult {
  data: import("./entities").LeadEntity[];
  total: number;
  page: number;
  limit: number;
}
