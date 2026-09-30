"use client";

import {
  formatWindowDay,
  getWindowDates,
} from "@/lib/availability-window";
import { cn } from "@/lib/utils";

type Props = {
  availableDateStrs: Set<string>;
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
};

export function TwoWeekDatePicker({
  availableDateStrs,
  selectedDate,
  onSelectDate,
}: Props) {
  const windowDates = getWindowDates();

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Önümüzdeki 14 gün · renkli günler müsait
      </p>
      <div className="grid grid-cols-7 gap-1.5">
        {windowDates.map((date) => {
          const meta = formatWindowDay(date);
          const available = availableDateStrs.has(meta.dateStr);
          const selected = selectedDate === meta.dateStr;
          return (
            <button
              key={meta.dateStr}
              type="button"
              disabled={!available}
              onClick={() => available && onSelectDate(meta.dateStr)}
              className={cn(
                "rounded-xl border px-1 py-2 text-center transition",
                !available && "cursor-not-allowed opacity-40",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : available
                    ? "border-primary/30 bg-primary/5 hover:border-primary"
                    : "border-border bg-muted/30",
              )}
            >
              <p
                className={cn(
                  "text-[10px] font-medium uppercase",
                  selected ? "text-primary-foreground/80" : "text-muted-foreground",
                )}
              >
                {meta.weekday}
              </p>
              <p className="text-sm font-semibold tabular-nums">{meta.day}</p>
              <p
                className={cn(
                  "text-[10px]",
                  selected ? "text-primary-foreground/80" : "text-muted-foreground",
                )}
              >
                {meta.month}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function formatSelectedDateLabel(dateStr: string) {
  return formatWindowDay(new Date(`${dateStr}T12:00:00`)).label;
}
