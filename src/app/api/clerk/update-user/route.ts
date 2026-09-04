import logger from "@/shared/utils/logger";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { updateClerkUserBodySchema } from "@/shared/server/requestSchemas";
import { parseJsonBody, ValidationError } from "@/shared/server/parseRequest";

export async function POST(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await auth();

    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseJsonBody(req, updateClerkUserBodySchema);

    // Only allow a user to update their own Clerk profile
    if (body.userId !== sessionUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const clerk = await clerkClient();
    await clerk.users.updateUser(sessionUserId, {
      firstName: body.firstName,
      lastName: body.lastName,
    });

    return NextResponse.json(
      { message: "User updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          issues: error.issues,
        },
        { status: 400 }
      );
    }

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
