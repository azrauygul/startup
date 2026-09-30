import { createClient } from "@/lib/supabase/server";
import {
  ACTIVE_BOOKING_STATUSES,
  BOOKING_DETAIL_SELECT,
} from "@/lib/bookings-query";
import type { Booking, Profile } from "@/lib/types";

export async function fetchActiveBookingsForProfile(profile: Profile) {
  const supabase = await createClient();

  if (profile.role === "cleaner") {
    const { data: cleaner, error: cleanerError } = await supabase
      .from("cleaners")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (cleanerError) {
      return {
        bookings: [] as Booking[],
        error: cleanerError.message,
        needsCleanerProfile: false,
      };
    }

    if (!cleaner) {
      return {
        bookings: [] as Booking[],
        error: null,
        needsCleanerProfile: true,
      };
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(BOOKING_DETAIL_SELECT)
      .eq("cleaner_id", cleaner.id)
      .in("status", ACTIVE_BOOKING_STATUSES)
      .order("start_date", { ascending: true })
      .order("start_time", { ascending: true });

    return {
      bookings: (data ?? []) as Booking[],
      error: error?.message ?? null,
      needsCleanerProfile: false,
    };
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_DETAIL_SELECT)
    .eq("customer_id", profile.id)
    .in("status", ACTIVE_BOOKING_STATUSES)
    .order("start_date", { ascending: true })
    .order("start_time", { ascending: true });

  return {
    bookings: (data ?? []) as Booking[],
    error: error?.message ?? null,
    needsCleanerProfile: false,
  };
}
