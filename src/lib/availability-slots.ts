import { format, isBefore } from "date-fns";
import {
  getWindowDates,
  normalizeAvailabilitySlots,
} from "@/lib/availability-window";
import type { CleanerAvailability } from "@/lib/types";

export type BookedSlot = { date: string; time: string };

function parseMinutes(time: string): number {
  const [h, m] = time.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getSlotsForDate(
  rawSlots: CleanerAvailability[],
  dateStr: string,
): CleanerAvailability[] {
  const slots = normalizeAvailabilitySlots(rawSlots);
  return slots.filter((s) => s.available_date === dateStr);
}

export function getTimeSlotsForDate(
  rawSlots: CleanerAvailability[],
  date: Date,
  booked: BookedSlot[],
  slotMinutes = 60,
): string[] {
  const dateStr = format(date, "yyyy-MM-dd");
  const daySlots = getSlotsForDate(rawSlots, dateStr);
  if (daySlots.length === 0) return [];

  const bookedTimes = new Set(
    booked
      .filter((b) => b.date === dateStr)
      .map((b) => b.time.slice(0, 5)),
  );

  const now = new Date();
  const isToday = dateStr === format(now, "yyyy-MM-dd");
  const result: string[] = [];

  for (const slot of daySlots) {
    let start = parseMinutes(slot.start_time);
    const end = parseMinutes(slot.end_time);

    while (start + slotMinutes <= end) {
      const timeStr = formatMinutes(start);

      if (isToday) {
        const slotDate = new Date(date);
        const [h, m] = timeStr.split(":").map(Number);
        slotDate.setHours(h, m, 0, 0);
        if (isBefore(slotDate, now)) {
          start += slotMinutes;
          continue;
        }
      }

      if (!bookedTimes.has(timeStr)) {
        result.push(timeStr);
      }
      start += slotMinutes;
    }
  }

  return [...new Set(result)].sort();
}

export function getAvailableDates(
  rawSlots: CleanerAvailability[],
  booked: BookedSlot[],
): Date[] {
  if (rawSlots.length === 0) return [];

  return getWindowDates().filter(
    (date) => getTimeSlotsForDate(rawSlots, date, booked).length > 0,
  );
}

export function isSlotAvailable(
  rawSlots: CleanerAvailability[],
  booked: BookedSlot[],
  dateStr: string,
  timeStr: string,
): boolean {
  const date = new Date(`${dateStr}T12:00:00`);
  const available = getTimeSlotsForDate(rawSlots, date, booked);
  return available.includes(timeStr.slice(0, 5));
}

export function groupSlotsByDate(rawSlots: CleanerAvailability[]) {
  const slots = normalizeAvailabilitySlots(rawSlots);
  const map = new Map<string, CleanerAvailability[]>();
  for (const slot of slots) {
    if (!slot.available_date) continue;
    const list = map.get(slot.available_date) ?? [];
    list.push(slot);
    map.set(slot.available_date, list);
  }
  return map;
}
