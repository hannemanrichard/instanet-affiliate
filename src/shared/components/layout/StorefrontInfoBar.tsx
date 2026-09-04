"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";

const STORAGE_KEY = "storefront-info-bar-closed";

export const StorefrontInfoBar = () => {
  const t = useTranslations("storefront.infoBar");
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Check if the bar was previously closed
    const wasClosed = localStorage.getItem(STORAGE_KEY) === "true";
    setIsClosed(wasClosed);
  }, []);

  const handleClose = () => {
    setIsClosed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (isClosed) {
    return null;
  }

  const content = t("content");
  // Make phone number bold (0670642456)
  const phoneNumber = "0670642456";
  const parts = content.split(phoneNumber);
  const formattedContent =
    parts.length > 1 ? (
      <>
        {parts[0]} <span className="font-semibold">{phoneNumber}</span>
        {parts[1]}
      </>
    ) : (
      content
    );

  return (
    <div className="relative border-b bg-[#1F242A] text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-4">
          <span className="text-center text-sm font-medium">
            {formattedContent}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-6 w-6 rounded-full text-white hover:bg-white/20 hover:text-white focus-visible:ring-white/50"
            aria-label={t("close")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
