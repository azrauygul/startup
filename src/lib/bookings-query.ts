import type { BookingStatus } from "@/lib/types";

/** PostgREST: bookings ↔ customer/cleaner ilişkileri (belirsiz join hatasını önler) */
export const BOOKING_DETAIL_SELECT =
  "*, cleaners!bookings_cleaner_id_fkey(*, profiles!cleaners_profile_id_fkey(*)), profiles!bookings_customer_id_fkey(*)";

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
];

export const HISTORY_BOOKING_STATUSES: BookingStatus[] = [
  "completed",
  "cancelled",
];
