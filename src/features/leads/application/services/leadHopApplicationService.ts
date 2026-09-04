import { SupabaseLeadHopService } from "../../data";
import type {
  CreateLeadHopInput,
  LeadHopEntity,
  UpdateLeadHopInput,
} from "../../domain";
import { LeadHopError } from "../../domain";
import type { LeadHopRepository } from "../../domain/repositories";

export class LeadHopApplicationService {
  constructor(private readonly leadHopRepository: LeadHopRepository) {}

  async getAllLeadHops(): Promise<LeadHopEntity[]> {
    try {
      return await this.leadHopRepository.getAll();
    } catch {
      throw new LeadHopError(
        "Failed to load lead hops",
        "LEAD_HOP_FETCH_FAILED"
      );
    }
  }

  async getLeadHopsByLeadId(leadId: number): Promise<LeadHopEntity[]> {
    try {
      return await this.leadHopRepository.getByLeadId(leadId);
    } catch {
      throw new LeadHopError(
        "Failed to load lead hops for lead",
        "LEAD_HOP_FETCH_FAILED"
      );
    }
  }

  async getLeadHopsByAgentId(agentId: number): Promise<LeadHopEntity[]> {
    try {
      return await this.leadHopRepository.getByAgentId(agentId);
    } catch {
      throw new LeadHopError(
        "Failed to load lead hops for agent",
        "LEAD_HOP_FETCH_FAILED"
      );
    }
  }

  async getLeadHop(
    leadId: number,
    agentId: number
  ): Promise<LeadHopEntity | null> {
    try {
      return await this.leadHopRepository.getById(leadId, agentId);
    } catch {
      throw new LeadHopError(
        "Failed to load lead hop",
        "LEAD_HOP_FETCH_FAILED"
      );
    }
  }

  async createLeadHop(data: CreateLeadHopInput): Promise<LeadHopEntity> {
    try {
      // Check if the hop already exists
      const existing = await this.leadHopRepository.getById(
        data.lead_id,
        data.agent_id
      );
      if (existing) {
        throw new LeadHopError(
          "Lead hop already exists",
          "LEAD_HOP_ALREADY_EXISTS"
        );
      }

      return await this.leadHopRepository.create(data);
    } catch (error) {
      if (error instanceof LeadHopError) throw error;
      throw new LeadHopError(
        "Failed to create lead hop",
        "LEAD_HOP_CREATE_FAILED"
      );
    }
  }

  async updateLeadHop(
    leadId: number,
    agentId: number,
    data: UpdateLeadHopInput
  ): Promise<LeadHopEntity> {
    try {
      // Check if the hop exists
      const existing = await this.leadHopRepository.getById(leadId, agentId);
      if (!existing) {
        throw new LeadHopError("Lead hop not found", "LEAD_HOP_NOT_FOUND");
      }

      return await this.leadHopRepository.update(leadId, agentId, data);
    } catch (error) {
      if (error instanceof LeadHopError) throw error;
      throw new LeadHopError(
        "Failed to update lead hop",
        "LEAD_HOP_UPDATE_FAILED"
      );
    }
  }

  async deleteLeadHop(leadId: number, agentId: number): Promise<void> {
    try {
      // Check if the hop exists
      const existing = await this.leadHopRepository.getById(leadId, agentId);
      if (!existing) {
        throw new LeadHopError("Lead hop not found", "LEAD_HOP_NOT_FOUND");
      }

      await this.leadHopRepository.delete(leadId, agentId);
    } catch (error) {
      if (error instanceof LeadHopError) throw error;
      throw new LeadHopError(
        "Failed to delete lead hop",
        "LEAD_HOP_DELETE_FAILED"
      );
    }
  }

  async deleteLeadHopsByLeadId(leadId: number): Promise<void> {
    try {
      await this.leadHopRepository.deleteByLeadId(leadId);
    } catch {
      throw new LeadHopError(
        "Failed to delete lead hops",
        "LEAD_HOP_DELETE_FAILED"
      );
    }
  }
}

const leadHopService = new SupabaseLeadHopService();

export const leadHopApplicationService = new LeadHopApplicationService(
  leadHopService
);

