"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  className?: string;
};

export function LegalCheckbox({
  id,
  checked,
  onCheckedChange,
  label,
  className,
}: Props) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3 text-left",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
      />
      <span className="text-xs leading-relaxed text-muted-foreground">{label}</span>
    </label>
  );
}
