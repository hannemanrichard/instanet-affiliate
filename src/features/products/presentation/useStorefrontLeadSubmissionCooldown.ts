"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getLeadSubmissionCooldownRemainingMs,
  isLeadSubmissionBlocked,
  STOREFRONT_LEAD_SUBMISSION_COOLDOWN_MS,
} from "../utils/storefrontLeadSubmissionCooldown";

export const useStorefrontLeadSubmissionCooldown = (slug: string) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState(0);

  const sync = useCallback(() => {
    if (typeof window === "undefined") return;
    const blocked = isLeadSubmissionBlocked(slug);
    const remainingMs = getLeadSubmissionCooldownRemainingMs(slug);
    setIsBlocked(blocked);
    setMinutesRemaining(
      blocked ? Math.max(1, Math.ceil(remainingMs / 60_000)) : 0
    );
  }, [slug]);

  useEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    if (typeof window === "undefined" || !slug) return;
    const remainingMs = getLeadSubmissionCooldownRemainingMs(slug);
    if (remainingMs <= 0) return;
    const timeoutId = window.setTimeout(() => {
      sync();
    }, remainingMs + 100);
    return () => window.clearTimeout(timeoutId);
  }, [slug, sync]);

  return {
    isBlocked,
    minutesRemaining,
    /** Call after a successful submission so this tab reflects the lock immediately */
    refresh: sync,
    cooldownMs: STOREFRONT_LEAD_SUBMISSION_COOLDOWN_MS,
  };
};
