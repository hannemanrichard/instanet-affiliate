export interface LeadEntity {
  id: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  commune?: string;
  wilaya?: string;
  channel?: string;
  comment?: string;
  color?: string;
  size?: string;
  product?: string;
  status?: string;
  objective?: string;
  offer?: string;
  price?: string;
  agent_id?: number;
  partner_id?: number;
  created_at?: string;
  last_changed_status?: string;
  has_recourse?: boolean;
  is_abondoned?: boolean;
  is_moved?: boolean;
  is_wholesale?: boolean;
}

export interface LeadItemEntity {
  lead_id: number;
  item_id: number;
  qty: number;
}

export interface LeadWithItems {
  lead: LeadEntity;
  items: LeadItemEntity[];
}

export interface LeadSummary {
  total_leads: number;
  total_pending: number;
  total_confirmed: number;
  total_wholesale: number;
}

export interface CreateLeadItemInput {
  item_id: number;
  qty: number;
}

export interface UpdateLeadItemInput {
  item_id: number;
  qty: number;
}

export interface LeadHopEntity {
  lead_id: number;
  agent_id: number;
}

export interface CreateLeadHopInput {
  lead_id: number;
  agent_id: number;
}

export interface UpdateLeadHopInput {
  lead_id?: number;
  agent_id?: number;
}

