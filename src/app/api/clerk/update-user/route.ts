import logger from "@/shared/utils/logger";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await auth();

    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, firstName, lastName } = body as {
      userId?: string;
      firstName?: string;
      lastName?: string;
    };

    // Only allow a user to update their own Clerk profile
    if (!userId || userId !== sessionUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (typeof firstName !== "string" || typeof lastName !== "string") {
      return NextResponse.json(
        { error: "firstName and lastName are required" },
        { status: 400 }
      );
    }

    const clerk = await clerkClient();
    await clerk.users.updateUser(sessionUserId, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });

    return NextResponse.json(
      { message: "User updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error(
      "Error updating user",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
