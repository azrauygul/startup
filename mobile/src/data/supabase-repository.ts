import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import type { PickedFile, Repository } from './repository';
import { RepositoryError } from './repository';
import type {
  Booking,
  BookingStatus,
  Cleaner,
  CleanerProfileInput,
  Message,
  NewBooking,
  Review,
  Role,
  Slot,
  User,
} from './types';
import { defaultPrices, type PriceTable } from '@/config/pricing';
import type { SlotTemplateId } from '@/config/slots';
import { filterContactInfo } from '@/lib/contact-filter';
import { todayISO } from '@/lib/dates';

const STATUS_FROM_DB: Record<string, BookingStatus> = {
  pending: 'onaylandi',
  confirmed: 'onaylandi',
  completed: 'tamamlandi',
  cancelled: 'iptal',
};

const CLEANER_SELECT = '*, profiles(full_name, avatar_url)';

function mapCleaner(row: any): Cleaner {
  return {
    id: row.id,
    fullName: row.profiles?.full_name ?? '',
    photoUrl: row.profiles?.avatar_url ?? null,
    city: row.city,
    districts: row.service_areas ?? [],
    bio: row.bio ?? '',
    yearsExperience: row.years_experience ?? 0,
    cleaningTypes: row.cleaning_types ?? ['genel'],
    prices: (row.prices as PriceTable) ?? defaultPrices(),
    rules: row.rules ?? { noDogs: false, noCats: false, noPets: false, other: '' },
    insuranceStatus: row.insurance_status ?? 'yok',
    insuranceDocName: row.insurance_doc_path ? String(row.insurance_doc_path).split('/').pop()! : null,
    ratingAvg: Number(row.rating ?? 0),
    ratingCount: row.review_count ?? 0,
    completedJobs: row.completed_jobs ?? 0,
  };
}

function mapBooking(row: any, reviewedIds: Set<string>): Booking {
  return {
    id: row.id,
    cleanerId: row.cleaner_id,
    cleanerName: row.cleaners?.profiles?.full_name ?? '',
    cleanerPhotoUrl: row.cleaners?.profiles?.avatar_url ?? null,
    customerId: row.customer_id,
    customerName: row.profiles?.full_name ?? '',
    slotId: row.slot_id,
    date: row.start_date,
    template: row.slot_template ?? 'sabah',
    answers: row.answers ?? {},
    packageId: row.package_id ?? 'tek',
    price: row.price,
    paymentId: row.payment_id ?? '',
    status: STATUS_FROM_DB[row.status] ?? 'onaylandi',
    reviewed: reviewedIds.has(row.id),
    createdAt: row.created_at,
  };
}

function fail(error: { message: string } | null): asserts error is null {
  if (error) throw new RepositoryError(error.message);
}

export class SupabaseRepository implements Repository {
  readonly mode = 'supabase' as const;
  readonly client: SupabaseClient;

  constructor(url: string, anonKey: string) {
    this.client = createClient(url, anonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    });
  }

  private async userId() {
    const { data } = await this.client.auth.getUser();
    if (!data.user) throw new RepositoryError('Lütfen giriş yapın.');
    return data.user.id;
  }

  async currentUser(): Promise<User | null> {
    const { data } = await this.client.auth.getUser();
    if (!data.user) return null;
    const { data: profile } = await this.client
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', data.user.id)
      .single();
    if (!profile) return null;
    const role: Role = profile.role === 'cleaner' ? 'temizlikci' : 'musteri';
    let cleanerId: string | undefined;
    if (role === 'temizlikci') {
      const { data: c } = await this.client.from('cleaners').select('id').eq('profile_id', profile.id).maybeSingle();
      cleanerId = c?.id;
    }
    return { id: profile.id, fullName: profile.full_name, role, cleanerId };
  }

  async signInDemo(): Promise<User> {
    throw new RepositoryError('Demo girişi yalnızca demo modunda.');
  }

  async signIn(email: string, password: string) {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw new RepositoryError('E-posta veya şifre hatalı.');
    return (await this.currentUser())!;
  }

  async signUp(input: { email: string; password: string; fullName: string; role: Role }) {
    const { data, error } = await this.client.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { full_name: input.fullName, role: input.role === 'temizlikci' ? 'cleaner' : 'customer' } },
    });
    fail(error);
    if (!data.session) throw new RepositoryError('E-postanıza gelen bağlantıya tıklayıp tekrar giriş yapın.');
    if (input.role === 'temizlikci') {
      const prices = defaultPrices();
      const { error: e } = await this.client.from('cleaners').insert({
        profile_id: data.user!.id,
        prices,
        daily_rate: prices['2+1'],
        monthly_rate: 0,
      });
      fail(e);
    }
    return (await this.currentUser())!;
  }

  async signOut() {
    await this.client.auth.signOut();
  }

  async listCleaners() {
    const { data, error } = await this.client.from('cleaners').select(CLEANER_SELECT).order('rating', { ascending: false });
    fail(error);
    return (data ?? []).map(mapCleaner);
  }

  async getCleaner(id: string) {
    const { data, error } = await this.client.from('cleaners').select(CLEANER_SELECT).eq('id', id).maybeSingle();
    fail(error);
    return data ? mapCleaner(data) : null;
  }

  async updateCleanerProfile(cleanerId: string, input: CleanerProfileInput) {
    const uid = await this.userId();
    const { error: pe } = await this.client.from('profiles').update({ avatar_url: input.photoUrl }).eq('id', uid);
    fail(pe);
    const { error } = await this.client
      .from('cleaners')
      .update({
        bio: filterContactInfo(input.bio).text,
        cleaning_types: input.cleaningTypes,
        prices: input.prices,
        daily_rate: input.prices['2+1'],
        rules: { ...input.rules, other: filterContactInfo(input.rules.other).text },
        service_areas: input.districts,
        years_experience: input.yearsExperience,
      })
      .eq('id', cleanerId);
    fail(error);
    return (await this.getCleaner(cleanerId))!;
  }

  private async upload(bucket: string, path: string, file: PickedFile) {
    const body = await (await fetch(file.uri)).arrayBuffer();
    const { error } = await this.client.storage
      .from(bucket)
      .upload(path, body, { contentType: file.mimeType ?? undefined, upsert: true });
    fail(error);
  }

  async uploadPhoto(_cleanerId: string, file: PickedFile) {
    const uid = await this.userId();
    const path = `${uid}/avatar-${Date.now()}.jpg`;
    await this.upload('avatars', path, file);
    return this.client.storage.from('avatars').getPublicUrl(path).data.publicUrl;
  }

  async uploadInsuranceDocument(cleanerId: string, file: PickedFile) {
    const uid = await this.userId();
    const path = `${uid}/${Date.now()}-${file.name}`;
    await this.upload('insurance-docs', path, file);
    const { error } = await this.client
      .from('cleaners')
      .update({ insurance_status: 'inceleniyor', insurance_doc_path: path })
      .eq('id', cleanerId);
    fail(error);
    return (await this.getCleaner(cleanerId))!;
  }

  async listSlots(cleanerId: string): Promise<Slot[]> {
    const { data, error } = await this.client
      .from('availability_slots')
      .select('*')
      .eq('cleaner_id', cleanerId)
      .gte('slot_date', todayISO())
      .order('slot_date');
    fail(error);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      cleanerId: r.cleaner_id,
      date: r.slot_date,
      template: r.template,
      booked: r.booked,
    }));
  }

  async setSlotOpen(cleanerId: string, date: string, template: SlotTemplateId, open: boolean) {
    if (open) {
      const { error } = await this.client
        .from('availability_slots')
        .upsert({ cleaner_id: cleanerId, slot_date: date, template }, { onConflict: 'cleaner_id,slot_date,template' });
      fail(error);
    } else {
      const { data, error } = await this.client
        .from('availability_slots')
        .delete()
        .match({ cleaner_id: cleanerId, slot_date: date, template, booked: false })
        .select('id');
      fail(error);
      if (!data?.length) throw new RepositoryError('Bu saatte randevunuz var, kapatamazsınız.');
    }
  }

  async createBooking(input: NewBooking) {
    const { data, error } = await this.client.rpc('book_slot', {
      p_slot_id: input.slotId,
      p_answers: { ...input.answers, notes: filterContactInfo(input.answers.notes ?? '').text },
      p_package_id: input.packageId,
      p_price: input.price,
      p_payment_token: input.paymentId,
    });
    fail(error);
    return (await this.getBooking(data as string))!;
  }

  private async bookingsQuery(filter?: { id: string }) {
    let q = this.client
      .from('bookings')
      .select('*, cleaners(profiles(full_name, avatar_url)), profiles(full_name)')
      .not('slot_id', 'is', null)
      .order('start_date');
    if (filter) q = q.eq('id', filter.id);
    const { data, error } = await q;
    fail(error);
    const rows = data ?? [];
    const { data: reviews } = await this.client
      .from('reviews')
      .select('booking_id')
      .in('booking_id', rows.map((r: any) => r.id));
    const reviewed = new Set((reviews ?? []).map((r: any) => r.booking_id as string));
    return rows.map((r: any) => mapBooking(r, reviewed));
  }

  async listMyBookings() {
    return this.bookingsQuery();
  }

  async getBooking(id: string) {
    return (await this.bookingsQuery({ id }))[0] ?? null;
  }

  async completeBooking(id: string) {
    const { error } = await this.client.from('bookings').update({ status: 'completed' }).eq('id', id);
    fail(error);
  }

  async cancelBooking(id: string) {
    const { error } = await this.client.from('bookings').update({ status: 'cancelled' }).eq('id', id);
    fail(error);
  }

  async listMessages(bookingId: string): Promise<Message[]> {
    const { data, error } = await this.client
      .from('messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at');
    fail(error);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      bookingId: r.booking_id,
      senderRole: r.sender_role === 'cleaner' ? 'temizlikci' : 'musteri',
      text: r.body,
      masked: r.masked,
      createdAt: r.created_at,
    }));
  }

  async sendMessage(bookingId: string, text: string): Promise<Message> {
    const user = await this.currentUser();
    if (!user) throw new RepositoryError('Lütfen giriş yapın.');
    const filtered = filterContactInfo(text.trim());
    const { data, error } = await this.client
      .from('messages')
      .insert({
        booking_id: bookingId,
        sender_id: user.id,
        sender_role: user.role === 'temizlikci' ? 'cleaner' : 'customer',
        body: filtered.text,
        masked: filtered.changed,
      })
      .select('*')
      .single();
    fail(error);
    return {
      id: data.id,
      bookingId,
      senderRole: user.role,
      text: data.body,
      masked: data.masked,
      createdAt: data.created_at,
    };
  }

  async listReviews(cleanerId: string): Promise<Review[]> {
    const { data, error } = await this.client
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('cleaner_id', cleanerId)
      .order('created_at', { ascending: false });
    fail(error);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      bookingId: r.booking_id,
      cleanerId: r.cleaner_id,
      customerName: r.profiles?.full_name ?? '',
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
    }));
  }

  async addReview(bookingId: string, rating: number, comment: string) {
    const uid = await this.userId();
    const booking = await this.getBooking(bookingId);
    if (!booking) throw new RepositoryError('Randevu bulunamadı.');
    const { error } = await this.client.from('reviews').insert({
      booking_id: bookingId,
      cleaner_id: booking.cleanerId,
      reviewer_id: uid,
      rating,
      comment: filterContactInfo(comment.trim()).text,
    });
    fail(error);
  }
}
