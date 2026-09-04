import logger from "@/shared/utils/logger";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  productImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    logger.info("Upload complete for file:", file);
    return { url: file.url };
  }),
  profileImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { success: true, url: file.url };
  }),
  productLibrary: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
  }).onUploadComplete(async ({ file }) => {
    logger.info("Upload complete for file:", file);
    return { url: file.url };
  }),
  productVideo: f({
    video: { maxFileSize: "64MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    logger.info("Upload complete for video file:", file);
    return { url: file.url };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
