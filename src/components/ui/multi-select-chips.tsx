"use client";

import { cn } from "@/lib/utils";

type Props = {
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  emptyLabel?: string;
};

export function MultiSelectChips({
  options,
  value,
  onChange,
  disabled,
  emptyLabel = "Seçim yapın",
}: Props) {
  if (options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Önce şehir seçin; ilçeler burada listelenir.
      </p>
    );
  }

  const toggle = (option: string) => {
    if (disabled) return;
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => toggle(option)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      {value.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyLabel}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {value.length} ilçe seçildi
        </p>
      )}
    </div>
  );
}
