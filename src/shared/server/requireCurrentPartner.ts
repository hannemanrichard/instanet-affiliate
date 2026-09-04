import { auth, currentUser } from "@clerk/nextjs/server";
import { partnerApplicationService } from "@/features/partners/application/services/partnerApplicationService";
import type { PartnerEntity } from "@/features/partners/domain";
import { PartnerError } from "@/features/partners/domain";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Resolves the authenticated Clerk user to a partners row.
 * Never trusts a client-supplied partner id.
 */
export const requireCurrentPartner = async (): Promise<PartnerEntity> => {
  const { userId } = await auth();
  if (!userId) {
    throw new UnauthorizedError();
  }

  const user = await currentUser();
  if (!user) {
    throw new UnauthorizedError();
  }

  const email = user.primaryEmailAddress?.emailAddress
    ?? user.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new PartnerError(
      "Authenticated user has no email",
      "PARTNER_EMAIL_REQUIRED"
    );
  }

  return partnerApplicationService.getOrCreatePartner({
    email,
    fullname: [user.firstName, user.lastName].filter(Boolean).join(" "),
    username: email.split("@")[0],
    avatar: user.imageUrl,
  });
};
