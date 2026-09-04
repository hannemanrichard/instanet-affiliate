import { SupabasePartnerService } from "../../data";
import type {
  PartnerEntity,
  UpsertPartnerInput,
  UpdatePaymentInput,
} from "../../domain";
import { PartnerError } from "../../domain";
import type { PartnerRepository } from "../../domain/repositories";

export class PartnerApplicationService {
  constructor(private readonly partnerRepository: PartnerRepository) {}

  async getByEmail(email: string): Promise<PartnerEntity | null> {
    try {
      if (!email.trim()) return null;
      return await this.partnerRepository.getByEmail(email.trim());
    } catch {
      throw new PartnerError(
        "Failed to load partner",
        "PARTNER_FETCH_FAILED"
      );
    }
  }

  async getOrCreatePartner(input: UpsertPartnerInput): Promise<PartnerEntity> {
    try {
      if (!input.email.trim()) {
        throw new PartnerError(
          "Partner email is required",
          "PARTNER_EMAIL_REQUIRED"
        );
      }
      return await this.partnerRepository.upsertByEmail(input);
    } catch (error) {
      if (error instanceof PartnerError) throw error;
      throw new PartnerError(
        "Failed to resolve partner",
        "PARTNER_UPSERT_FAILED"
      );
    }
  }
  async updatePayment(
    partnerId: number,
    input: UpdatePaymentInput
  ): Promise<PartnerEntity> {
    try {
      return await this.partnerRepository.updatePayment(partnerId, input);
    } catch (error) {
      if (error instanceof PartnerError) throw error;
      throw new PartnerError(
        "Failed to update payment settings",
        "PARTNER_PAYMENT_UPDATE_FAILED"
      );
    }
  }
}

const partnerService = new SupabasePartnerService();
export const partnerApplicationService = new PartnerApplicationService(
  partnerService
);
