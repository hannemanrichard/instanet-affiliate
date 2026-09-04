"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export type QuantityProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  decreaseAriaLabel?: string;
  increaseAriaLabel?: string;
  className?: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const Quantity = ({
  value,
  onChange,
  min = 1,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  disabled = false,
  id,
  "aria-label": ariaLabel = "Quantity",
  decreaseAriaLabel = "Decrease quantity",
  increaseAriaLabel = "Increase quantity",
  className,
}: QuantityProps) => {
  const safeMax = Number.isFinite(max) ? max : Number.POSITIVE_INFINITY;
  const canDecrease = !disabled && value - step >= min;
  const canIncrease = !disabled && value + step <= safeMax;

  const handleCommit = (next: number) => {
    if (!Number.isFinite(next)) return;
    onChange(clamp(Math.round(next), min, safeMax));
  };

  const handleDecrease = () => {
    if (!canDecrease) return;
    handleCommit(value - step);
  };

  const handleIncrease = () => {
    if (!canIncrease) return;
    handleCommit(value + step);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (raw === "") {
      onChange(min);
      return;
    }
    handleCommit(Number(raw));
  };

  return (
    <div
      className={cn(
        "inline-flex h-9 items-center overflow-hidden rounded-md border border-input bg-background",
        disabled && "opacity-50",
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canDecrease}
        onClick={handleDecrease}
        aria-label={decreaseAriaLabel}
        className="h-9 w-9 shrink-0 rounded-none"
      >
        <Minus className="h-4 w-4" aria-hidden />
      </Button>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={Number.isFinite(safeMax) ? safeMax : undefined}
        step={step}
        value={value}
        disabled={disabled}
        onChange={handleInputChange}
        aria-label={ariaLabel}
        className="h-9 w-14 rounded-none border-0 border-x border-input bg-transparent px-1 text-center shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canIncrease}
        onClick={handleIncrease}
        aria-label={increaseAriaLabel}
        className="h-9 w-9 shrink-0 rounded-none"
      >
        <Plus className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
};
