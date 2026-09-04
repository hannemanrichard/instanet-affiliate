"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { useLanguage } from "@/shared/hooks/use-language";
import { Loader } from "@/shared/components/ui/loader";
import logger from "@/shared/utils/logger";

type Messages = Record<string, any>;

interface I18nContextType {
  locale: string;
  changeLanguage: (locale: string) => void;
  isLoading: boolean;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const { locale, changeLanguage, isLoading, isRTL } = useLanguage();
  const [messages, setMessages] = useState<Messages>({});

  // Load messages for the current locale
  useEffect(() => {
    const loadMessages = async () => {
      try {
        let messagesModule;
        switch (locale) {
          case "ar":
            messagesModule = await import("@/i18n/messages/ar.json");
            break;
          case "fr":
            messagesModule = await import("@/i18n/messages/fr.json");
            break;
          default:
            messagesModule = await import("@/i18n/messages/en.json");
        }
        setMessages(messagesModule.default);
      } catch (error) {
        logger.error(
          `Failed to load messages for locale ${locale}`,
          error instanceof Error ? error : new Error(String(error))
        );
        // Fallback to default locale (Arabic)
        try {
          const fallbackModule = await import("@/i18n/messages/ar.json");
          setMessages(fallbackModule.default);
        } catch (fallbackError) {
          logger.error(
            "Failed to load fallback messages",
            fallbackError instanceof Error
              ? fallbackError
              : new Error(String(fallbackError))
          );
          setMessages({});
        }
      }
    };

    if (!isLoading) {
      loadMessages();
    }
  }, [locale, isLoading]);

  // Don't render until we have messages
  if (isLoading || Object.keys(messages).length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <I18nContext.Provider
      value={{
        locale,
        changeLanguage: (newLocale: string) => changeLanguage(newLocale as any),
        isLoading,
        isRTL,
      }}
    >
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  );
};
