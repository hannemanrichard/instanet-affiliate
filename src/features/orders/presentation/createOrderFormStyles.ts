import { cn } from "@/shared/utils/utils";

/** Shared chrome for the affiliate create-order dialog (scoped, not global shadcn). */

export const fieldLabelClass = "text-sm font-semibold text-[#222]";

export const controlClass =
  "h-11 rounded-xl border-[#d9d9d9] bg-white shadow-none focus:border-[#222] focus-visible:ring-1 focus-visible:ring-[#222]/20";

export const sectionClass = "space-y-3";

export const sectionTitleClass =
  "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

export const itemCardClass =
  "space-y-3 rounded-xl border border-[#e2e2e2] bg-[#fafafa] p-4";

export const optionIdleClass =
  "border-[#d9d9d9] text-[#333] hover:border-black focus-visible:ring-2 focus-visible:ring-black/60";

export const optionSelectedClass =
  "border-black text-[#222] shadow-[0_8px_24px_rgba(34,34,34,0.12)]";

export const optionBaseClass =
  "relative flex cursor-pointer items-center justify-center outline-none transition";

/** Delivery type segments — dashboard primary accent (not storefront black). */
export const segmentOptionClass = (selected: boolean) =>
  cn(
    optionBaseClass,
    "flex-1 gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold",
    selected
      ? "border-primary bg-primary/10 text-primary shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
      : "border-[#d9d9d9] bg-white text-[#333] hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/30"
  );

export const colorSwatchClass = (selected: boolean, disabled: boolean) =>
  cn(
    optionBaseClass,
    "gap-2 rounded-xl border-2 p-1 text-base uppercase",
    selected && !disabled ? optionSelectedClass : optionIdleClass,
    disabled && "pointer-events-none opacity-40"
  );

export const sizePillClass = (selected: boolean, disabled: boolean) =>
  cn(
    optionBaseClass,
    "rounded-2xl border-[3px] px-4 py-2 text-base uppercase",
    selected && !disabled ? optionSelectedClass : optionIdleClass,
    disabled && "pointer-events-none opacity-60"
  );
