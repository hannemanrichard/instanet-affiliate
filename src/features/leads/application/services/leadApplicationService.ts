import {
  SupabaseLeadHopService,
  SupabaseLeadItemService,
  SupabaseLeadService,
} from "../../data";
import type {
  CreateLeadInput,
  CreateLeadItemInput,
  LeadEntity,
  LeadItemEntity,
  LeadSummary,
  LeadWithItems,
  UpdateLeadInput,
  UpdateLeadItemInput,
} from "../../domain";
import { LeadError, LeadHopError, LeadItemError } from "../../domain";
import type {
  LeadHopRepository,
  LeadItemRepository,
  LeadRepository,
} from "../../domain/repositories";
import type { LeadFilters } from "../../domain/valueObjects";
import { assignRandomUser } from "../../utils/assignUser";

export interface CreateLeadPayload {
  lead: CreateLeadInput;
  items?: CreateLeadItemInput[];
}

export interface UpdateLeadPayload {
  lead?: UpdateLeadInput;
  items?: UpdateLeadItemInput[];
}

export class LeadApplicationService {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly leadItemRepository: LeadItemRepository,
    private readonly leadHopRepository?: LeadHopRepository
  ) {}

  async getLeads(filters?: LeadFilters): Promise<LeadEntity[]> {
    try {
      if (filters?.search?.trim()) {
        return await this.leadRepository.search(filters.search.trim());
      }

      if (filters?.status) {
        return await this.leadRepository.getByStatus(filters.status);
      }

      return await this.leadRepository.getAll();
    } catch {
      throw new LeadError("Failed to load leads", "LEAD_FETCH_FAILED");
    }
  }

  async getLeadDetail(leadId: number): Promise<LeadWithItems> {
    try {
      const result = await this.leadRepository.getWithItems(leadId);
      if (!result) {
        throw new LeadError("Lead not found", "LEAD_NOT_FOUND");
      }
      return result;
    } catch (error) {
      if (error instanceof LeadError) throw error;
      throw new LeadError("Failed to load lead", "LEAD_FETCH_FAILED");
    }
  }

  async getLeadItems(leadId: number): Promise<LeadItemEntity[]> {
    try {
      return await this.leadItemRepository.getByLeadId(leadId);
    } catch {
      throw new LeadItemError(
        "Failed to load lead items",
        "LEAD_ITEM_FETCH_FAILED"
      );
    }
  }

  async getLeadSummary(): Promise<LeadSummary> {
    try {
      return await this.leadRepository.getSummary();
    } catch {
      throw new LeadError(
        "Failed to load lead summary",
        "LEAD_SUMMARY_FETCH_FAILED"
      );
    }
  }

  async createLead(payload: CreateLeadPayload): Promise<LeadWithItems> {
    try {
      // Auto-assign agent if not provided
      const leadData = { ...payload.lead };
      if (!leadData.agent_id) {
        const agents = await this.leadRepository.getAgents();
        const assignedAgent = assignRandomUser(agents);
        if (assignedAgent) {
          leadData.agent_id = assignedAgent.id;
        }
      }

      // Auto-assign tracker if not provided
      // Note: tracker_id is not in LeadEntity yet, but we'll prepare for it
      // For now, we'll fetch trackers but not assign until tracker_id is added to the schema
      // const trackers = await this.leadRepository.getTrackers();
      // const assignedTracker = assignRandomUser(trackers);
      // if (assignedTracker) {
      //   leadData.tracker_id = assignedTracker.id;
      // }

      const lead = await this.leadRepository.create(leadData);
      let items: LeadItemEntity[] = [];

      if (payload.items?.length) {
        items = await this.leadItemRepository.createMany(
          lead.id,
          payload.items
        );
      }

      return { lead, items };
    } catch {
      throw new LeadError("Failed to create lead", "LEAD_CREATE_FAILED");
    }
  }

  async updateLead(
    leadId: number,
    payload: UpdateLeadPayload
  ): Promise<LeadWithItems> {
    try {
      if (payload.lead) {
        await this.leadRepository.update(leadId, payload.lead);
      }

      if (payload.items) {
        await this.leadItemRepository.updateMany(leadId, payload.items);
      }

      const updated = await this.leadRepository.getWithItems(leadId);
      if (!updated) {
        throw new LeadError("Lead not found after update", "LEAD_NOT_FOUND");
      }
      return updated;
    } catch (error) {
      if (error instanceof LeadError) throw error;
      throw new LeadError("Failed to update lead", "LEAD_UPDATE_FAILED");
    }
  }

  async replaceLeadItems(
    leadId: number,
    items: UpdateLeadItemInput[]
  ): Promise<LeadItemEntity[]> {
    try {
      return await this.leadItemRepository.updateMany(leadId, items);
    } catch {
      throw new LeadItemError(
        "Failed to update lead items",
        "LEAD_ITEM_UPDATE_FAILED"
      );
    }
  }

  async deleteLead(leadId: number): Promise<void> {
    try {
      await this.leadItemRepository.deleteByLeadId(leadId);
      if (this.leadHopRepository) {
        await this.leadHopRepository.deleteByLeadId(leadId);
      }
      await this.leadRepository.delete(leadId);
    } catch {
      throw new LeadError("Failed to delete lead", "LEAD_DELETE_FAILED");
    }
  }
}

const leadService = new SupabaseLeadService();
const leadItemService = new SupabaseLeadItemService();
const leadHopService = new SupabaseLeadHopService();

export const leadApplicationService = new LeadApplicationService(
  leadService,
  leadItemService,
  leadHopService
);
