import { auth, currentUser } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import {
  requireCurrentPartner,
  UnauthorizedError,
} from "./requireCurrentPartner";
import type { PartnerEntity } from "@/features/partners/domain";

export type DashboardActor =
  | { role: "admin"; user: User; partner: null }
  | { role: "partner"; user: User; partner: PartnerEntity };

const resolveRole = (user: User): string | undefined => {
  const role = user.publicMetadata?.role;
  return typeof role === "string" ? role : undefined;
};

/**
 * Resolves Clerk session to admin or partner actor.
 * Partner actors always resolve a partners row; admins do not require one.
 */
export const requireDashboardActor = async (): Promise<DashboardActor> => {
  const { userId } = await auth();
  if (!userId) {
    throw new UnauthorizedError();
  }

  const user = await currentUser();
  if (!user) {
    throw new UnauthorizedError();
  }

  const role = resolveRole(user);

  if (role === "admin") {
    return { role: "admin", user, partner: null };
  }

  const partner = await requireCurrentPartner();
  return { role: "partner", user, partner };
};

export const requireAdminActor = async (): Promise<DashboardActor> => {
  const actor = await requireDashboardActor();
  if (actor.role !== "admin") {
    throw new UnauthorizedError("Admin access required");
  }
  return actor;
};
