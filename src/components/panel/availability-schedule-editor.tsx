"use client";

import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AVAILABILITY_WINDOW_DAYS,
  formatWindowDay,
  getWindowDates,
  isDateInWindow,
} from "@/lib/availability-window";
import { cn } from "@/lib/utils";
import type { CleanerAvailability } from "@/lib/types";

export type DateSlotDraft = {
  available_date: string;
  start_time: string;
  end_time: string;
};

type Props = {
  availability: CleanerAvailability[];
  slots: DateSlotDraft[];
  onChange: (slots: DateSlotDraft[]) => void;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

function buildInitialSlots(availability: CleanerAvailability[]): DateSlotDraft[] {
  const dated = availability.filter((a) => a.available_date);
  if (dated.length > 0) {
    return dated
      .filter((a) => isDateInWindow(a.available_date!))
      .map((a) => ({
        available_date: a.available_date!,
        start_time: a.start_time.slice(0, 5),
        end_time: a.end_time.slice(0, 5),
      }));
  }

  const windowDates = getWindowDates();
  const result: DateSlotDraft[] = [];
  for (const date of windowDates) {
    const dow = date.getDay();
    const dateStr = format(date, "yyyy-MM-dd");
    for (const slot of availability.filter((a) => a.day_of_week === dow)) {
      result.push({
        available_date: dateStr,
        start_time: slot.start_time.slice(0, 5),
        end_time: slot.end_time.slice(0, 5),
      });
    }
  }
  return result;
}

export function initDateSlotsFromAvailability(
  availability: CleanerAvailability[],
): DateSlotDraft[] {
  return buildInitialSlots(availability);
}

export function AvailabilityScheduleEditor({
  availability,
  slots,
  onChange,
  selectedDate,
  onSelectDate,
}: Props) {
  const windowDates = getWindowDates();

  const datesWithSlots = new Set(slots.map((s) => s.available_date));
  const activeDate =
    selectedDate && isDateInWindow(selectedDate)
      ? selectedDate
      : windowDates.find((d) => datesWithSlots.has(format(d, "yyyy-MM-dd")))
        ? format(
            windowDates.find((d) =>
              datesWithSlots.has(format(d, "yyyy-MM-dd")),
            )!,
            "yyyy-MM-dd",
          )
        : format(windowDates[0], "yyyy-MM-dd");

  const daySlots = slots.filter((s) => s.available_date === activeDate);

  function updateDaySlots(next: DateSlotDraft[]) {
    const others = slots.filter((s) => s.available_date !== activeDate);
    onChange([...others, ...next]);
  }

  function enableDay() {
    if (daySlots.length > 0) return;
    updateDaySlots([
      { available_date: activeDate, start_time: "09:00", end_time: "17:00" },
    ]);
  }

  function disableDay() {
    onChange(slots.filter((s) => s.available_date !== activeDate));
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>Önümüzdeki {AVAILABILITY_WINDOW_DAYS} gün</Label>
        <p className="text-xs text-muted-foreground">
          Her gün yeni bir gün eklenir; müşteriler yalnızca bu aralıktan randevu
          alabilir. Müsait günlerinizi seçin ve saat aralığı belirleyin.
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {windowDates.map((date) => {
          const meta = formatWindowDay(date);
          const hasSlots = datesWithSlots.has(meta.dateStr);
          const selected = activeDate === meta.dateStr;
          return (
            <button
              key={meta.dateStr}
              type="button"
              onClick={() => onSelectDate(meta.dateStr)}
              className={cn(
                "rounded-xl border px-1 py-2 text-center transition",
                selected
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : hasSlots
                    ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                    : "border-border bg-muted/30 hover:border-primary/30",
              )}
            >
              <p className="text-[10px] font-medium uppercase text-muted-foreground">
                {meta.weekday}
              </p>
              <p className="text-sm font-semibold tabular-nums">{meta.day}</p>
              <p className="text-[10px] text-muted-foreground">{meta.month}</p>
              {hasSlots ? (
                <span className="mx-auto mt-1 block size-1.5 rounded-full bg-primary" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border bg-muted/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium">
            {formatWindowDay(new Date(`${activeDate}T12:00:00`)).label}
          </p>
          {daySlots.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={disableDay}
            >
              Günü kapat
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={enableDay}
            >
              Müsait yap
            </Button>
          )}
        </div>

        {daySlots.length > 0 ? (
          <div className="mt-3 space-y-2">
            {daySlots.map((slot, index) => (
              <div
                key={`${slot.available_date}-${index}`}
                className="grid gap-2 rounded-xl bg-background p-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Input
                  type="time"
                  value={slot.start_time}
                  onChange={(e) =>
                    updateDaySlots(
                      daySlots.map((s, i) =>
                        i === index ? { ...s, start_time: e.target.value } : s,
                      ),
                    )
                  }
                />
                <Input
                  type="time"
                  value={slot.end_time}
                  onChange={(e) =>
                    updateDaySlots(
                      daySlots.map((s, i) =>
                        i === index ? { ...s, end_time: e.target.value } : s,
                      ),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    updateDaySlots(daySlots.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() =>
                updateDaySlots([
                  ...daySlots,
                  {
                    available_date: activeDate,
                    start_time: "09:00",
                    end_time: "17:00",
                  },
                ])
              }
            >
              <Plus className="size-4" />
              Saat aralığı ekle
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Bu gün kapalı. Müşteriler bu tarihten randevu alamaz.
          </p>
        )}
      </div>
    </div>
  );
}
