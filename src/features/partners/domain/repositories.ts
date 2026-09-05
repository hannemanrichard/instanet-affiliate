import type {
  PartnerEntity,
  UpsertPartnerInput,
  UpdatePaymentInput,
} from "./entities";

export interface PartnerRepository {
  getByEmail(email: string): Promise<PartnerEntity | null>;
  getById(id: number): Promise<PartnerEntity | null>;
  listAll(search?: string): Promise<PartnerEntity[]>;
  upsertByEmail(data: UpsertPartnerInput): Promise<PartnerEntity>;
  updatePayment(id: number, data: UpdatePaymentInput): Promise<PartnerEntity>;
}
