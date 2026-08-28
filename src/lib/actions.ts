"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  isSupabaseConfigured,
  SUPABASE_SETUP_MESSAGE,
} from "@/lib/supabase/env";
import {
  isCleaningType,
  isTurkeyCity,
  MIN_DAILY_RATE,
  MIN_MONTHLY_RATE,
} from "@/lib/constants";
import { getDistrictsForCity } from "@/lib/turkey-districts";
import type { BookingStatus, BookingType, UserRole } from "@/lib/types";

export type ActionResult = { error?: string; success?: string; url?: string };

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    value !== null &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    typeof value.arrayBuffer === "function"
  );
}

async function saveProfileAvatar(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  avatarUrl: string,
): Promise<ActionResult> {
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId);

  if (profileError) return { error: profileError.message };

  revalidatePath("/panel");
  revalidatePath("/dashboard");
  return { success: "Fotoğraf yüklendi.", url: avatarUrl };
}

function requireSupabase(): ActionResult | null {
  if (!isSupabaseConfigured()) {
    return { error: SUPABASE_SETUP_MESSAGE };
  }
  return null;
}

function mapAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("email not confirmed")) {
    return "E-posta henüz onaylanmamış. Supabase → Authentication → Users bölümünden kullanıcıyı Confirm edin veya Confirm email ayarını kapatın.";
  }
  if (lower.includes("invalid login credentials")) {
    return "E-posta veya şifre hatalı.";
  }
  if (lower.includes("user already registered")) {
    return "Bu e-posta ile zaten kayıt var. Giriş yapmayı dene.";
  }
  return message;
}

export async function signUp(formData: FormData): Promise<ActionResult> {
  const setup = requireSupabase();
  if (setup) return setup;

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(
    formData.get("full_name") ?? formData.get("fullName") ?? "",
  ).trim();
  const phone = String(formData.get("phone") ?? "");
  const role = String(formData.get("role") ?? "customer") as UserRole;

  if (!email || !password || !fullName) {
    return { error: "Lütfen zorunlu alanları doldurun." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          phone: phone || null,
        },
      },
    });

    if (error) return { error: mapAuthError(error.message) };

    // Confirm email açıksa session gelmez
    if (!data.session) {
      return {
        error:
          "Kayıt alındı ama e-posta onayı açık. MVP için Supabase → Authentication → Sign In / Providers → Email → Confirm email’i kapat, sonra tekrar giriş yap.",
      };
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : SUPABASE_SETUP_MESSAGE,
    };
  }

  redirect(role === "cleaner" ? "/panel" : "/dashboard");
}

export async function signIn(formData: FormData): Promise<ActionResult> {
  const setup = requireSupabase();
  if (setup) return setup;

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "E-posta ve şifre gerekli." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: mapAuthError(error.message) };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : SUPABASE_SETUP_MESSAGE,
    };
  }

  redirect("/dashboard");
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function uploadAvatar(formData: FormData): Promise<ActionResult> {
  const setup = requireSupabase();
  if (setup) return setup;

  const fileEntry = formData.get("avatar");
  if (!isUploadFile(fileEntry)) {
    return { error: "Geçerli bir fotoğraf seçin." };
  }

  const buffer = Buffer.from(await fileEntry.arrayBuffer());
  if (buffer.length === 0) {
    return { error: "Geçerli bir fotoğraf seçin." };
  }
  if (buffer.length > 2 * 1024 * 1024) {
    return { error: "Kırpılmış fotoğraf 2 MB'dan küçük olmalı." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  const path = `${user.id}/avatar-${Date.now()}.jpg`;
  const dataUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`;

  // Storage'a yedek kopyala (bucket public olmasa bile profil fotoğrafı data URL ile görünür)
  await supabase.storage.from("avatars").upload(path, buffer, {
    contentType: "image/jpeg",
    upsert: false,
  });

  return saveProfileAvatar(supabase, user.id, dataUrl);
}

export async function createBooking(input: {
  cleanerId: string;
  bookingType: BookingType;
  startDate: string;
  endDate?: string | null;
  notes?: string;
}): Promise<ActionResult> {
  const setup = requireSupabase();
  if (setup) return setup;

  if (input.cleanerId.startsWith("demo-cleaner-")) {
    return {
      error:
        "Bu bir demo profil. Gerçek talep için Operasyon panelinden kayıtlı temizlikçi gerekir.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  const { error } = await supabase.from("bookings").insert({
    customer_id: user.id,
    cleaner_id: input.cleanerId,
    booking_type: input.bookingType,
    start_date: input.startDate,
    end_date: input.bookingType === "monthly" ? input.endDate : null,
    notes: input.notes || null,
    status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath("/bookings");
  revalidatePath("/panel");
  return { success: "Kiralama talebiniz oluşturuldu." };
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<ActionResult> {
  const setup = requireSupabase();
  if (setup) return setup;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) return { error: error.message };

  revalidatePath("/panel");
  revalidatePath("/bookings");
  return { success: "Durum güncellendi." };
}

export async function createReview(input: {
  bookingId: string;
  cleanerId: string;
  rating: number;
  comment: string;
}): Promise<ActionResult> {
  const setup = requireSupabase();
  if (setup) return setup;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  if (input.rating < 1 || input.rating > 5) {
    return { error: "Puan 1–5 arasında olmalı." };
  }

  const { error } = await supabase.from("reviews").insert({
    booking_id: input.bookingId,
    cleaner_id: input.cleanerId,
    reviewer_id: user.id,
    rating: input.rating,
    comment: input.comment.trim(),
  });

  if (error) return { error: error.message };

  revalidatePath("/bookings");
  revalidatePath("/dashboard");
  revalidatePath(`/cleaners/${input.cleanerId}`);
  return { success: "Değerlendirmeniz kaydedildi." };
}

export async function ensureCleanerProfile(input: {
  bio: string;
  dailyRate: number;
  monthlyRate: number;
  services: string[];
  serviceAreas: string[];
  specialRequests: string;
  city: string;
  avatarUrl?: string;
}): Promise<ActionResult> {
  const setup = requireSupabase();
  if (setup) return setup;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "cleaner") {
    return { error: "Bu işlem sadece temizlik personeli için." };
  }

  if (!isTurkeyCity(input.city)) {
    return { error: "Geçerli bir il seçin." };
  }

  const districts = getDistrictsForCity(input.city);
  const serviceAreas = input.serviceAreas.filter((a) => districts.includes(a));
  if (serviceAreas.length === 0) {
    return { error: "En az bir ilçe / semt seçin." };
  }

  const services = input.services.filter(isCleaningType);
  if (services.length === 0) {
    return { error: "En az bir temizlik türü seçin." };
  }

  if (input.dailyRate < MIN_DAILY_RATE) {
    return { error: `Günlük ücret en az ${MIN_DAILY_RATE} ₺ olmalı.` };
  }

  if (input.monthlyRate < MIN_MONTHLY_RATE) {
    return { error: `Aylık ücret en az ${MIN_MONTHLY_RATE.toLocaleString("tr-TR")} ₺ olmalı.` };
  }

  if (input.avatarUrl !== undefined) {
    const { error: avatarError } = await supabase
      .from("profiles")
      .update({
        avatar_url: input.avatarUrl.trim() || null,
      })
      .eq("id", user.id);
    if (avatarError) return { error: avatarError.message };
  }

  const payload = {
    bio: input.bio.trim(),
    daily_rate: input.dailyRate,
    monthly_rate: input.monthlyRate,
    services_offered: services,
    service_areas: serviceAreas,
    special_requests: input.specialRequests.trim(),
    city: input.city,
  };

  const { data: existing } = await supabase
    .from("cleaners")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("cleaners")
      .update(payload)
      .eq("id", existing.id)
      .eq("profile_id", user.id);
    if (error) return { error: error.message };
  } else {
    const { count } = await supabase
      .from("cleaners")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id);

    if (count && count > 0) {
      return { error: "Her personel yalnızca bir profil kartı oluşturabilir." };
    }

    const { error } = await supabase.from("cleaners").insert({
      profile_id: user.id,
      ...payload,
    });
    if (error) {
      if (error.code === "23505") {
        return { error: "Bu hesap için zaten bir profil kartı var." };
      }
      return { error: error.message };
    }
  }

  revalidatePath("/panel");
  revalidatePath("/dashboard");
  revalidatePath("/home");
  return { success: "Profil kaydedildi." };
}

export async function saveAvailability(
  cleanerId: string,
  slots: { day_of_week: number; start_time: string; end_time: string }[],
): Promise<ActionResult> {
  const setup = requireSupabase();
  if (setup) return setup;

  const supabase = await createClient();

  await supabase.from("cleaner_availability").delete().eq("cleaner_id", cleanerId);

  if (slots.length > 0) {
    const { error } = await supabase.from("cleaner_availability").insert(
      slots.map((s) => ({ ...s, cleaner_id: cleanerId })),
    );
    if (error) return { error: error.message };
  }

  revalidatePath("/panel");
  revalidatePath(`/cleaners/${cleanerId}`);
  return { success: "Müsaitlik güncellendi." };
}
