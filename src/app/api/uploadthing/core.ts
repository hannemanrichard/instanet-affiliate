import { auth, currentUser } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import logger from "@/shared/utils/logger";
import { consumeRateLimit } from "@/shared/server/rateLimit";

const f = createUploadthing();

/**
 * Auth for client-initiated upload requests (has Clerk session cookies).
 * Do NOT protect `/api/uploadthing` in Clerk middleware — UploadThing
 * server callbacks have no Clerk session and verify via UT signing instead.
 */
const requireAuthenticatedUpload = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new UploadThingError("Unauthorized");
  }

  const rateLimit = consumeRateLimit({
    bucket: "uploadthing-authenticated",
    identifier: userId,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    throw new UploadThingError("Too many upload requests");
  }

  return { userId };
};

const requireAdminUpload = async () => {
  const { userId } = await requireAuthenticatedUpload();
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  if (typeof role !== "string" || role !== "admin") {
    throw new UploadThingError("Admin access required");
  }
  return { userId, role: "admin" as const };
};

export const ourFileRouter = {
  productImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(requireAdminUpload)
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info("Upload complete for product image", {
        userId: metadata.userId,
        file,
      });
      return { url: file.url };
    }),

  profileImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(requireAuthenticatedUpload)
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info("Upload complete for profile image", {
        userId: metadata.userId,
        file,
      });
      return { success: true, url: file.url };
    }),

  productLibrary: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
  })
    .middleware(requireAdminUpload)
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info("Upload complete for product library", {
        userId: metadata.userId,
        file,
      });
      return { url: file.url };
    }),

  productVideo: f({
    video: { maxFileSize: "64MB", maxFileCount: 1 },
  })
    .middleware(requireAdminUpload)
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info("Upload complete for product video", {
        userId: metadata.userId,
        file,
      });
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
