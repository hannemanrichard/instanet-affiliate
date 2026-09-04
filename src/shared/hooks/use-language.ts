"use client";

import { clientConfig } from "@/i18n/config";
import { useEffect, useState } from "react";

export type Locale = "en" | "ar" | "fr";

export const useLanguage = () => {
  const [locale, setLocale] = useState<Locale>(clientConfig.defaultLocale);
  const [isLoading, setIsLoading] = useState(true);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem(clientConfig.storageKey) as Locale;
    if (savedLocale && clientConfig.locales.includes(savedLocale)) {
      setLocale(savedLocale);
    }
    setIsLoading(false);
  }, []);

  // Save language to localStorage and update state
  const changeLanguage = (newLocale: Locale) => {
    if (clientConfig.locales.includes(newLocale)) {
      setLocale(newLocale);
      localStorage.setItem(clientConfig.storageKey, newLocale);

      // Update HTML lang and dir attributes
      document.documentElement.lang = newLocale;
      document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
    }
  };

  // Initialize HTML attributes on mount
  useEffect(() => {
    if (!isLoading) {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    }
  }, [locale, isLoading]);

  return {
    locale,
    changeLanguage,
    isLoading,
    isRTL: locale === "ar",
  };
};
