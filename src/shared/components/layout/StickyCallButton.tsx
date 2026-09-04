"use client";

import { Phone } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

const PHONE_NUMBER = "0670642456";

export const StickyCallButton = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        asChild
        size="icon"
        className="h-14 w-14 rounded-full bg-gray-800 text-white shadow-lg hover:bg-gray-900 focus-visible:ring-gray-700"
        aria-label={`Call ${PHONE_NUMBER}`}
      >
        <a href={`tel:${PHONE_NUMBER}`}>
          <Phone className="h-6 w-6" />
        </a>
      </Button>
    </div>
  );
};
