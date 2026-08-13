export type UserRole = "customer" | "cleaner";
export type BookingType = "daily" | "monthly";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Cleaner = {
  id: string;
  profile_id: string;
  bio: string;
  rating: number;
  review_count: number;
  daily_rate: number;
  monthly_rate: number;
  services_offered: string[];
  service_areas: string[];
  special_requests: string;
  city: string;
  created_at: string;
  profiles?: Profile | null;
};

export type CleanerAvailability = {
  id: string;
  cleaner_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export type Booking = {
  id: string;
  customer_id: string;
  cleaner_id: string;
  booking_type: BookingType;
  start_date: string;
  end_date: string | null;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  cleaners?: Cleaner | null;
  profiles?: Profile | null;
};

export type Review = {
  id: string;
  booking_id: string;
  cleaner_id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: Profile | null;
};

export const DAY_LABELS = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
] as const;

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Beklemede",
  confirmed: "Onaylandı",
  completed: "Tamamlandı",
  cancelled: "İptal",
};
