import { PartnerApplicationService } from "../../application/services/partnerApplicationService";
import type { PartnerEntity } from "../../domain";
import type { PartnerRepository } from "../../domain/repositories";

const createPartnerRepositoryMock = (): jest.Mocked<PartnerRepository> => ({
  getByEmail: jest.fn(),
  getById: jest.fn(),
  upsertByEmail: jest.fn(),
});

describe("PartnerApplicationService", () => {
  let repository: jest.Mocked<PartnerRepository>;
  let service: PartnerApplicationService;

  const partner: PartnerEntity = {
    id: 42,
    email: "partner@example.com",
    fullname: "Partner User",
    username: "partner",
    status: "active",
    created_at: "2026-01-01",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = createPartnerRepositoryMock();
    service = new PartnerApplicationService(repository);
  });

  it("returns partner by email", async () => {
    repository.getByEmail.mockResolvedValue(partner);

    const result = await service.getByEmail("partner@example.com");

    expect(repository.getByEmail).toHaveBeenCalledWith("partner@example.com");
    expect(result).toEqual(partner);
  });

  it("upserts partner when resolving", async () => {
    repository.upsertByEmail.mockResolvedValue(partner);

    const result = await service.getOrCreatePartner({
      email: "partner@example.com",
      fullname: "Partner User",
    });

    expect(repository.upsertByEmail).toHaveBeenCalled();
    expect(result.id).toBe(42);
  });

  it("rejects missing email", async () => {
    await expect(
      service.getOrCreatePartner({ email: "   " })
    ).rejects.toMatchObject({ code: "PARTNER_EMAIL_REQUIRED" });
  });
});
