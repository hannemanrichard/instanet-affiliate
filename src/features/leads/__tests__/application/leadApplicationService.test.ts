import type {
  CreateLeadInput,
  LeadEntity,
  LeadSummary,
  LeadWithItems,
  UpdateLeadInput,
} from "../../domain";
import {
  LeadApplicationService,
  type CreateLeadPayload,
} from "../../application/services/leadApplicationService";
import type {
  LeadItemRepository,
  LeadRepository,
} from "../../domain/repositories";

const createLeadRepositoryMock = (): jest.Mocked<LeadRepository> => ({
  getAll: jest.fn(),
  getPaginated: jest.fn(),
  getById: jest.fn(),
  getByStatus: jest.fn(),
  search: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getWithItems: jest.fn(),
  getSummary: jest.fn(),
  getAgents: jest.fn().mockResolvedValue([]),
  getTrackers: jest.fn().mockResolvedValue([]),
});

const createLeadItemRepositoryMock = (): jest.Mocked<LeadItemRepository> => ({
  getByLeadId: jest.fn(),
  createMany: jest.fn(),
  updateMany: jest.fn(),
  deleteByLeadId: jest.fn(),
});

describe("LeadApplicationService", () => {
  let leadRepository: jest.Mocked<LeadRepository>;
  let leadItemRepository: jest.Mocked<LeadItemRepository>;
  let service: LeadApplicationService;

  const baseLead: LeadEntity = {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    phone: "123",
    address: undefined,
    commune: undefined,
    wilaya: undefined,
    channel: undefined,
    comment: undefined,
    color: undefined,
    size: undefined,
    product: undefined,
    status: "new",
    objective: undefined,
    offer: undefined,
    agent_id: undefined,
    partner_id: undefined,
    created_at: undefined,
    last_changed_status: undefined,
    has_recourse: undefined,
    is_abondoned: undefined,
    is_moved: undefined,
    is_wholesale: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    leadRepository = createLeadRepositoryMock();
    leadItemRepository = createLeadItemRepositoryMock();
    service = new LeadApplicationService(leadRepository, leadItemRepository);
  });

  describe("getLeads", () => {
    it("returns leads by status scoped to partner", async () => {
      const leads = [baseLead];
      leadRepository.getByStatus.mockResolvedValue(leads);

      const result = await service.getLeads({ status: "new", partnerId: 42 });

      expect(leadRepository.getByStatus).toHaveBeenCalledWith("new", 42);
      expect(result).toEqual(leads);
    });

    it("performs search when term provided", async () => {
      leadRepository.search.mockResolvedValue([baseLead]);

      await service.getLeads({ search: "john", partnerId: 42 });

      expect(leadRepository.search).toHaveBeenCalledWith("john", 42);
    });

    it("returns all leads with partner filter", async () => {
      leadRepository.getAll.mockResolvedValue([baseLead]);

      await service.getLeads({ partnerId: 42 });

      expect(leadRepository.getAll).toHaveBeenCalledWith({ partnerId: 42 });
    });
  });

  describe("getPaginatedLeads", () => {
    it("delegates to repository pagination", async () => {
      leadRepository.getPaginated.mockResolvedValue({
        data: [baseLead],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.getPaginatedLeads(
        { partnerId: 42, status: "new" },
        { page: 1, limit: 10 }
      );

      expect(leadRepository.getPaginated).toHaveBeenCalledWith(
        { partnerId: 42, status: "new" },
        { page: 1, limit: 10 }
      );
      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });
  });

  describe("createLead", () => {
    it("creates lead with items", async () => {
      const payload: CreateLeadPayload = {
        lead: {
          ...baseLead,
          id: undefined as unknown as number,
        } as CreateLeadInput,
        items: [
          {
            item_id: 10,
            qty: 2,
          },
        ],
      };

      leadRepository.create.mockResolvedValue(baseLead);
      leadItemRepository.createMany.mockResolvedValue([
        { lead_id: 1, item_id: 10, qty: 2 },
      ]);

      const result = await service.createLead(payload);

      expect(result.lead.id).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(leadItemRepository.createMany).toHaveBeenCalledWith(1, payload.items);
    });
  });

  describe("updateLead", () => {
    it("updates lead and items", async () => {
      const updated: LeadWithItems = {
        lead: { ...baseLead, status: "qualified" },
        items: [],
      };

      leadRepository.getWithItems.mockResolvedValue(updated);

      await service.updateLead(1, {
        lead: { status: "qualified" } as UpdateLeadInput,
        items: [{ item_id: 3, qty: 5 }],
      });

      expect(leadRepository.update).toHaveBeenCalledWith(1, { status: "qualified" });
      expect(leadItemRepository.updateMany).toHaveBeenCalledWith(1, [
        { item_id: 3, qty: 5 },
      ]);
    });
  });

  describe("replaceLeadItems", () => {
    it("delegates to item repository", async () => {
      const items = [{ lead_id: 1, item_id: 4, qty: 2 }];
      leadItemRepository.updateMany.mockResolvedValue(items);

      const result = await service.replaceLeadItems(1, [{ item_id: 4, qty: 2 }]);

      expect(result).toEqual(items);
    });
  });

  describe("deleteLead", () => {
    it("deletes lead after removing items", async () => {
      await service.deleteLead(2);

      expect(leadItemRepository.deleteByLeadId).toHaveBeenCalledWith(2);
      expect(leadRepository.delete).toHaveBeenCalledWith(2);
    });
  });

  describe("getLeadSummary", () => {
    it("returns summary from repository", async () => {
      const summary: LeadSummary = {
        total_leads: 5,
        total_pending: 3,
        total_confirmed: 1,
        total_wholesale: 1,
      };
      leadRepository.getSummary.mockResolvedValue(summary);

      const result = await service.getLeadSummary(42);

      expect(leadRepository.getSummary).toHaveBeenCalledWith(42);
      expect(result).toEqual(summary);
    });
  });
});

