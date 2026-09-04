"use client";

import { cn } from "@/shared/utils/utils";
import { useCallback, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Loader } from "@/shared/components/ui/loader";
import { Button } from "./button";
import { useToast } from "@/shared/hooks/use-toast";
import { UploadDropzone } from "@/shared/utils/uploadthing";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import logger from "@/shared/utils/logger";

interface UploadAreaProps {
  value?: string;
  onChange?: (url: string) => void;
  className?: string;
  endpoint: keyof OurFileRouter;
  alt: string;
}

export function UploadArea({
  value,
  onChange,
  className,
  endpoint,
  alt,
}: UploadAreaProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleRemoveImage = useCallback(() => {
    onChange?.("");
  }, [onChange]);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6",
        className
      )}
    >
      {value ? (
        <div className="relative aspect-square w-40 h-40 min-h-0 overflow-hidden rounded-lg">
          <Image
            src={value}
            alt={alt}
            fill
            className="object-cover"
            sizes="160px"
            unoptimized
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <UploadDropzone
          endpoint={endpoint}
          onUploadBegin={() => {
            setIsUploading(true);
            logger.debug("Upload starting...");
          }}
          onClientUploadComplete={(res) => {
            logger.debug("Upload completed", res);
            setIsUploading(false);
            if (res?.[0]?.url) {
              onChange?.(res[0].url);
              toast({
                title: "Success",
                description: "Image uploaded successfully",
              });
            }
          }}
          onUploadError={(error: Error) => {
            logger.error("Upload error", error);
            setIsUploading(false);
            toast({
              title: "Error",
              description: error.message || "Failed to upload image",
              variant: "destructive",
            });
          }}
          className="ut-button:bg-primary ut-button:ut-uploading:bg-primary/50 ut-button:ut-ready:bg-primary ut-allowed-content:text-muted-foreground"
        />
      )}

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader />
        </div>
      )}
    </div>
  );
}
