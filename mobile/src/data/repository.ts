import type {
  Booking,
  Cleaner,
  CleanerProfileInput,
  Message,
  NewBooking,
  Review,
  Role,
  Slot,
  User,
} from './types';
import type { SlotTemplateId } from '@/config/slots';

export type PickedFile = { uri: string; name: string; mimeType?: string | null };

export interface Repository {
  readonly mode: 'demo' | 'supabase';

  currentUser(): Promise<User | null>;
  /** Demo mode only: sign in as a seeded account. */
  signInDemo(role: Role): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signUp(input: { email: string; password: string; fullName: string; role: Role }): Promise<User>;
  signOut(): Promise<void>;

  listCleaners(): Promise<Cleaner[]>;
  getCleaner(id: string): Promise<Cleaner | null>;
  updateCleanerProfile(cleanerId: string, input: CleanerProfileInput): Promise<Cleaner>;
  uploadPhoto(cleanerId: string, file: PickedFile): Promise<string>;
  uploadInsuranceDocument(cleanerId: string, file: PickedFile): Promise<Cleaner>;

  /** Future slots (today onward), booked or not. */
  listSlots(cleanerId: string): Promise<Slot[]>;
  setSlotOpen(cleanerId: string, date: string, template: SlotTemplateId, open: boolean): Promise<void>;

  /** Atomically takes the slot and creates a confirmed booking. */
  createBooking(input: NewBooking): Promise<Booking>;
  listMyBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | null>;
  completeBooking(id: string): Promise<void>;
  cancelBooking(id: string): Promise<void>;

  listMessages(bookingId: string): Promise<Message[]>;
  /** Text is run through the contact filter before it is stored. */
  sendMessage(bookingId: string, text: string): Promise<Message>;

  listReviews(cleanerId: string): Promise<Review[]>;
  addReview(bookingId: string, rating: number, comment: string): Promise<void>;
}

export class RepositoryError extends Error {}
