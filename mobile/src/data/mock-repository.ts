import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PickedFile, Repository } from './repository';
import { RepositoryError } from './repository';
import {
  DEMO_CLEANER_USER,
  DEMO_CUSTOMER,
  SEED_CLEANERS,
  seedBookings,
  seedMessages,
  seedReviews,
  seedSlots,
} from './seed';
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
import { filterContactInfo } from '@/lib/contact-filter';
import { todayISO } from '@/lib/dates';

const STORAGE_KEY = 'mismis-demo-v1';

type DB = {
  user: User | null;
  cleaners: Cleaner[];
  slots: Slot[];
  bookings: Booking[];
  reviews: Review[];
  messages: Message[];
};

function freshDB(): DB {
  const slots = seedSlots();
  return {
    user: null,
    cleaners: structuredClone(SEED_CLEANERS),
    slots,
    bookings: seedBookings(slots),
    reviews: seedReviews(),
    messages: seedMessages(),
  };
}

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/** Offline demo backend persisted in AsyncStorage. Used when Supabase env vars are missing. */
export class MockRepository implements Repository {
  readonly mode = 'demo' as const;
  private db: DB | null = null;

  private async load(): Promise<DB> {
    if (this.db) return this.db;
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    this.db = raw ? (JSON.parse(raw) as DB) : freshDB();
    return this.db;
  }

  private async save() {
    if (this.db) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
  }

  async reset() {
    this.db = freshDB();
    await this.save();
  }

  private async requireUser() {
    const db = await this.load();
    if (!db.user) throw new RepositoryError('Lütfen giriş yapın.');
    return { db, user: db.user };
  }

  async currentUser() {
    return (await this.load()).user;
  }

  async signInDemo(role: Role) {
    const db = await this.load();
    db.user = role === 'musteri' ? DEMO_CUSTOMER : DEMO_CLEANER_USER;
    await this.save();
    return db.user;
  }

  async signIn(): Promise<User> {
    throw new RepositoryError('Demo modunda e-posta ile giriş yok.');
  }

  async signUp(): Promise<User> {
    throw new RepositoryError('Demo modunda kayıt yok.');
  }

  async signOut() {
    const db = await this.load();
    db.user = null;
    await this.save();
  }

  async listCleaners() {
    const db = await this.load();
    return [...db.cleaners].sort((a, b) => b.ratingAvg - a.ratingAvg);
  }

  async getCleaner(id: string) {
    return (await this.load()).cleaners.find((c) => c.id === id) ?? null;
  }

  private async ownCleaner(cleanerId: string) {
    const { db, user } = await this.requireUser();
    if (user.cleanerId !== cleanerId) throw new RepositoryError('Bu profili düzenleyemezsiniz.');
    const cleaner = db.cleaners.find((c) => c.id === cleanerId);
    if (!cleaner) throw new RepositoryError('Profil bulunamadı.');
    return { db, cleaner };
  }

  async updateCleanerProfile(cleanerId: string, input: CleanerProfileInput) {
    const { cleaner } = await this.ownCleaner(cleanerId);
    Object.assign(cleaner, {
      ...input,
      bio: filterContactInfo(input.bio).text,
      rules: { ...input.rules, other: filterContactInfo(input.rules.other).text },
    });
    await this.save();
    return cleaner;
  }

  async uploadPhoto(cleanerId: string, file: PickedFile) {
    await this.ownCleaner(cleanerId);
    return file.uri;
  }

  async uploadInsuranceDocument(cleanerId: string, file: PickedFile) {
    const { cleaner } = await this.ownCleaner(cleanerId);
    cleaner.insuranceStatus = 'inceleniyor';
    cleaner.insuranceDocName = file.name;
    await this.save();
    return cleaner;
  }

  async listSlots(cleanerId: string) {
    const today = todayISO();
    return (await this.load()).slots
      .filter((s) => s.cleanerId === cleanerId && s.date >= today)
      .sort((a, b) => (a.date + a.template).localeCompare(b.date + b.template));
  }

  async setSlotOpen(cleanerId: string, date: string, template: SlotTemplateId, open: boolean) {
    const { db } = await this.ownCleaner(cleanerId);
    const existing = db.slots.find((s) => s.cleanerId === cleanerId && s.date === date && s.template === template);
    if (open && !existing) {
      db.slots.push({ id: uid('s'), cleanerId, date, template, booked: false });
    } else if (!open && existing) {
      if (existing.booked) throw new RepositoryError('Bu saatte randevunuz var, kapatamazsınız.');
      db.slots = db.slots.filter((s) => s !== existing);
    }
    await this.save();
  }

  async createBooking(input: NewBooking) {
    const { db, user } = await this.requireUser();
    const slot = db.slots.find((s) => s.id === input.slotId && s.cleanerId === input.cleanerId);
    if (!slot || slot.booked) throw new RepositoryError('Bu saat az önce doldu. Lütfen başka bir saat seçin.');
    const cleaner = db.cleaners.find((c) => c.id === input.cleanerId)!;
    slot.booked = true;
    const booking: Booking = {
      id: uid('b'),
      cleanerId: cleaner.id,
      cleanerName: cleaner.fullName,
      cleanerPhotoUrl: cleaner.photoUrl,
      customerId: user.id,
      customerName: user.fullName,
      slotId: slot.id,
      date: slot.date,
      template: slot.template,
      answers: { ...input.answers, notes: filterContactInfo(input.answers.notes ?? '').text },
      packageId: input.packageId,
      price: input.price,
      paymentId: input.paymentId,
      status: 'onaylandi',
      reviewed: false,
      createdAt: new Date().toISOString(),
    };
    db.bookings.push(booking);
    await this.save();
    return booking;
  }

  async listMyBookings() {
    const { db, user } = await this.requireUser();
    return db.bookings
      .filter((b) => (user.role === 'musteri' ? b.customerId === user.id : b.cleanerId === user.cleanerId))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getBooking(id: string) {
    return (await this.listMyBookings()).find((b) => b.id === id) ?? null;
  }

  async completeBooking(id: string) {
    const { db, user } = await this.requireUser();
    const b = db.bookings.find((x) => x.id === id && x.cleanerId === user.cleanerId);
    if (!b) throw new RepositoryError('Randevu bulunamadı.');
    b.status = 'tamamlandi';
    const cleaner = db.cleaners.find((c) => c.id === b.cleanerId);
    if (cleaner) cleaner.completedJobs += 1;
    await this.save();
  }

  async cancelBooking(id: string) {
    const { db, user } = await this.requireUser();
    const b = db.bookings.find((x) => x.id === id && x.customerId === user.id);
    if (!b || b.status !== 'onaylandi') throw new RepositoryError('Bu randevu iptal edilemez.');
    b.status = 'iptal';
    const slot = db.slots.find((s) => s.id === b.slotId);
    if (slot) slot.booked = false;
    await this.save();
  }

  async listMessages(bookingId: string) {
    const booking = await this.getBooking(bookingId);
    if (!booking) return [];
    return (await this.load()).messages
      .filter((m) => m.bookingId === bookingId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async sendMessage(bookingId: string, text: string) {
    const { db, user } = await this.requireUser();
    if (!(await this.getBooking(bookingId))) throw new RepositoryError('Randevu bulunamadı.');
    const filtered = filterContactInfo(text.trim());
    const message: Message = {
      id: uid('m'),
      bookingId,
      senderRole: user.role,
      text: filtered.text,
      masked: filtered.changed,
      createdAt: new Date().toISOString(),
    };
    db.messages.push(message);
    await this.save();
    return message;
  }

  async listReviews(cleanerId: string) {
    return (await this.load()).reviews
      .filter((r) => r.cleanerId === cleanerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async addReview(bookingId: string, rating: number, comment: string) {
    const { db, user } = await this.requireUser();
    const b = db.bookings.find((x) => x.id === bookingId && x.customerId === user.id);
    if (!b || b.status !== 'tamamlandi') throw new RepositoryError('Sadece tamamlanan temizlikler değerlendirilebilir.');
    if (b.reviewed) throw new RepositoryError('Bu temizliği zaten değerlendirdiniz.');
    if (rating < 1 || rating > 5) throw new RepositoryError('Lütfen 1 ile 5 arasında yıldız seçin.');
    db.reviews.push({
      id: uid('r'),
      bookingId,
      cleanerId: b.cleanerId,
      customerName: user.fullName,
      rating,
      comment: filterContactInfo(comment.trim()).text,
      createdAt: todayISO(),
    });
    b.reviewed = true;
    const cleaner = db.cleaners.find((c) => c.id === b.cleanerId);
    if (cleaner) {
      const total = cleaner.ratingAvg * cleaner.ratingCount + rating;
      cleaner.ratingCount += 1;
      cleaner.ratingAvg = Math.round((total / cleaner.ratingCount) * 10) / 10;
    }
    await this.save();
  }
}
