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

interface UploadAreaMultipleProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  className?: string;
  endpoint: keyof OurFileRouter;
  alt: string;
}

export function UploadAreaMultiple({
  value = [],
  endpoint,
  alt,
  onChange,
  className,
}: UploadAreaMultipleProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleRemoveImage = useCallback(
    (indexToRemove: number) => {
      onChange?.(value.filter((_, index) => index !== indexToRemove));
    },
    [onChange, value]
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-3 gap-4">
        {value.map((url, index) => (
          <div
            key={url}
            className="relative aspect-square w-full h-full min-h-0 overflow-hidden rounded-lg"
          >
            <Image
              src={url}
              alt={`${alt} ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 200px"
              unoptimized
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => handleRemoveImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="relative rounded-lg border border-dashed p-6">
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
              onChange?.([...value, ...res.map((file) => file.url)]);
              toast({
                title: "Success",
                description: "Images uploaded successfully",
              });
            }
          }}
          onUploadError={(error: Error) => {
            logger.error("Upload error", error);
            setIsUploading(false);
            toast({
              title: "Error",
              description: error.message || "Failed to upload images",
              variant: "destructive",
            });
          }}
          className="ut-button:bg-primary ut-button:ut-uploading:bg-primary/50 ut-button:ut-ready:bg-primary ut-allowed-content:text-muted-foreground"
        />

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
}
