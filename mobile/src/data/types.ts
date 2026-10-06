import type { Answers } from '@/config/questionnaire';
import type { CleaningTypeId, PackageId, PriceQuote, PriceTable } from '@/config/pricing';
import type { SlotTemplateId } from '@/config/slots';

export type Role = 'musteri' | 'temizlikci';

export type User = {
  id: string;
  fullName: string;
  role: Role;
  /** Set for cleaner accounts. */
  cleanerId?: string;
};

export type InsuranceStatus = 'yok' | 'inceleniyor' | 'dogrulandi';

export type CleanerRules = {
  noDogs: boolean;
  noCats: boolean;
  noPets: boolean;
  /** Free-text rules, e.g. "Temizlik malzemesi evde olmalı". */
  other: string;
};

export type Cleaner = {
  id: string;
  fullName: string;
  photoUrl: string | null;
  city: string;
  districts: string[];
  bio: string;
  yearsExperience: number;
  cleaningTypes: CleaningTypeId[];
  prices: PriceTable;
  rules: CleanerRules;
  insuranceStatus: InsuranceStatus;
  insuranceDocName: string | null;
  ratingAvg: number;
  ratingCount: number;
  completedJobs: number;
};

export type Slot = {
  id: string;
  cleanerId: string;
  /** YYYY-MM-DD */
  date: string;
  template: SlotTemplateId;
  booked: boolean;
};

export type BookingStatus = 'onaylandi' | 'tamamlandi' | 'iptal';

export type Booking = {
  id: string;
  cleanerId: string;
  cleanerName: string;
  cleanerPhotoUrl: string | null;
  customerId: string;
  customerName: string;
  slotId: string;
  date: string;
  template: SlotTemplateId;
  answers: Answers;
  packageId: PackageId;
  /** Per-visit money breakdown (see config/pricing quote()). */
  price: PriceQuote;
  paymentId: string;
  status: BookingStatus;
  reviewed: boolean;
  createdAt: string;
};

export type Review = {
  id: string;
  bookingId: string;
  cleanerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type CleanerProfileInput = Pick<
  Cleaner,
  'photoUrl' | 'bio' | 'cleaningTypes' | 'prices' | 'rules' | 'districts' | 'yearsExperience'
>;

export type NewBooking = {
  cleanerId: string;
  slotId: string;
  answers: Answers;
  packageId: PackageId;
  price: PriceQuote;
  paymentId: string;
};

export type Message = {
  id: string;
  bookingId: string;
  senderRole: Role;
  text: string;
  /** True when the contact filter masked part of the text. */
  masked: boolean;
  createdAt: string;
};
