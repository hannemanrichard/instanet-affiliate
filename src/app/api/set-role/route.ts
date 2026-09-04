import logger from "@/shared/utils/logger";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { partnerApplicationService } from "@/features/partners/application/services/partnerApplicationService";

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  try {
    logger.debug("Setting role...");
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const clerk = await clerkClient();
    const existingMetadata = (user.publicMetadata ?? {}) as Record<
      string,
      unknown
    >;
    const role =
      typeof existingMetadata.role === "string"
        ? existingMetadata.role
        : "partner";

    // Merge metadata so we never wipe an existing role (or other fields)
    await clerk.users.updateUser(user.id, {
      publicMetadata: {
        ...existingMetadata,
        role,
        onboardingComplete: true,
      },
    });

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return new NextResponse("User email is required", { status: 400 });
    }

    await partnerApplicationService.getOrCreatePartner({
      email,
      fullname: [user.firstName, user.lastName].filter(Boolean).join(" "),
      username: email.split("@")[0],
      avatar: user.imageUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(
      "Error in set-role",
      error instanceof Error ? error : new Error(String(error))
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
