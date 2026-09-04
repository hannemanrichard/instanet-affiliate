import type {
  CreateLeadHopInput,
  CreateLeadItemInput,
  LeadEntity,
  LeadHopEntity,
  LeadItemEntity,
  LeadSummary,
  LeadWithItems,
  UpdateLeadHopInput,
  UpdateLeadItemInput,
} from "./entities";
import type { LeadStatus } from "./valueObjects";

export type CreateLeadInput = Omit<LeadEntity, "id" | "created_at" | "last_changed_status">;
export type UpdateLeadInput = Partial<Omit<LeadEntity, "id">>;

export interface UserOption {
  id: number;
  name: string | null;
  email: string;
}

export interface LeadRepository {
  getAll(): Promise<LeadEntity[]>;
  getById(id: number): Promise<LeadEntity | null>;
  getByStatus(status: LeadStatus): Promise<LeadEntity[]>;
  search(term: string): Promise<LeadEntity[]>;
  create(data: CreateLeadInput): Promise<LeadEntity>;
  update(id: number, data: UpdateLeadInput): Promise<LeadEntity>;
  delete(id: number): Promise<void>;
  getWithItems(id: number): Promise<LeadWithItems | null>;
  getSummary(): Promise<LeadSummary>;
  getAgents(): Promise<UserOption[]>;
  getTrackers(): Promise<UserOption[]>;
}

export interface LeadItemRepository {
  getByLeadId(leadId: number): Promise<LeadItemEntity[]>;
  createMany(leadId: number, items: CreateLeadItemInput[]): Promise<LeadItemEntity[]>;
  updateMany(leadId: number, items: UpdateLeadItemInput[]): Promise<LeadItemEntity[]>;
  deleteByLeadId(leadId: number): Promise<void>;
}

export interface LeadHopRepository {
  getAll(): Promise<LeadHopEntity[]>;
  getByLeadId(leadId: number): Promise<LeadHopEntity[]>;
  getByAgentId(agentId: number): Promise<LeadHopEntity[]>;
  getById(leadId: number, agentId: number): Promise<LeadHopEntity | null>;
  create(data: CreateLeadHopInput): Promise<LeadHopEntity>;
  update(leadId: number, agentId: number, data: UpdateLeadHopInput): Promise<LeadHopEntity>;
  delete(leadId: number, agentId: number): Promise<void>;
  deleteByLeadId(leadId: number): Promise<void>;
}

