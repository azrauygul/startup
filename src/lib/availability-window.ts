import { addDays, format, getDay, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";
import type { CleanerAvailability } from "@/lib/types";

export const AVAILABILITY_WINDOW_DAYS = 14;

export function getWindowStart(): Date {
  return startOfDay(new Date());
}

export function getWindowDates(): Date[] {
  const start = getWindowStart();
  return Array.from({ length: AVAILABILITY_WINDOW_DAYS }, (_, i) =>
    addDays(start, i),
  );
}

export function isDateInWindow(dateStr: string): boolean {
  const start = format(getWindowStart(), "yyyy-MM-dd");
  const end = format(
    addDays(getWindowStart(), AVAILABILITY_WINDOW_DAYS - 1),
    "yyyy-MM-dd",
  );
  return dateStr >= start && dateStr <= end;
}

export function formatWindowDay(date: Date) {
  return {
    dateStr: format(date, "yyyy-MM-dd"),
    weekday: format(date, "EEE", { locale: tr }),
    day: format(date, "d"),
    month: format(date, "MMM", { locale: tr }),
    label: format(date, "d MMMM EEEE", { locale: tr }),
  };
}

/** Eski haftalık kayıtları 14 günlük pencereye genişletir veya tarihli kayıtları filtreler. */
export function normalizeAvailabilitySlots(
  slots: CleanerAvailability[],
): CleanerAvailability[] {
  const dated = slots.filter((s) => s.available_date);
  if (dated.length > 0) {
    return dated.filter((s) => isDateInWindow(s.available_date!));
  }

  const expanded: CleanerAvailability[] = [];
  for (const date of getWindowDates()) {
    const dow = getDay(date);
    const dateStr = format(date, "yyyy-MM-dd");
    for (const slot of slots.filter((s) => s.day_of_week === dow)) {
      expanded.push({
        ...slot,
        available_date: dateStr,
      });
    }
  }
  return expanded;
}
