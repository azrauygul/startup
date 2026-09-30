import Link from "next/link";
import { Calendar, History, MessageCircle, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/bookings/review-form";
import { SetupBanner } from "@/components/setup-banner";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  BOOKING_DETAIL_SELECT,
  HISTORY_BOOKING_STATUSES,
} from "@/lib/bookings-query";
import { getHomeSizeLabel, getBookingFrequencyLabel } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/helpers";
import { telLink, whatsappLink, formatTime } from "@/lib/format";
import { STATUS_LABELS, type Booking, type Review } from "@/lib/types";

export default async function HistoryPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Temizlik geçmişim
        </h1>
        <SetupBanner show />
      </div>
    );
  }

  const profile = await getCurrentProfile();
  if (!profile || profile.role === "cleaner") {
    return (
      <div className="rounded-3xl border bg-card p-8 text-center">
        <h1 className="font-heading text-2xl font-semibold">Temizlik geçmişim</h1>
        <p className="mt-2 text-muted-foreground">
          Bu sayfa müşteri hesapları içindir.
        </p>
        <Button render={<Link href="/dashboard" />} className="mt-4 rounded-full">
          Keşfet&apos;e dön
        </Button>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(BOOKING_DETAIL_SELECT)
    .eq("customer_id", profile.id)
    .in("status", HISTORY_BOOKING_STATUSES)
    .order("start_date", { ascending: false });

  const list = (bookings ?? []) as Booking[];
  const completed = list.filter((b) => b.status === "completed");
  const cancelled = list.filter((b) => b.status === "cancelled");

  const bookingIds = list.map((b) => b.id);
  const { data: reviews } = bookingIds.length
    ? await supabase.from("reviews").select("*").in("booking_id", bookingIds)
    : { data: [] as Review[] };

  const reviewByBooking = new Map(
    ((reviews ?? []) as Review[]).map((r) => [r.booking_id, r]),
  );

  return (
    <div className="animate-fade-up space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Temizlik geçmişim
        </h1>
        <p className="text-muted-foreground">
          Tamamlanan ve iptal edilen randevularınızı buradan takip edin.
        </p>
      </div>

      {bookingsError ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm">
          Geçmiş yüklenemedi: {bookingsError.message}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-2xl font-semibold tabular-nums">{completed.length}</p>
          <p className="text-sm text-muted-foreground">Tamamlanan temizlik</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-2xl font-semibold tabular-nums">{cancelled.length}</p>
          <p className="text-sm text-muted-foreground">İptal edilen</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-2xl font-semibold tabular-nums">
            {reviewByBooking.size}
          </p>
          <p className="text-sm text-muted-foreground">Verdiğiniz puan</p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-card/60 p-10 text-center">
          <History className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 font-medium">Henüz tamamlanan temizlik yok.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            İlk randevunuzu oluşturduktan sonra geçmişiniz burada görünür.
          </p>
          <Button render={<Link href="/dashboard" />} className="mt-5 rounded-full">
            Personelleri keşfet
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((booking) => {
            const cleanerName =
              booking.cleaners?.profiles?.full_name ?? "Personel";
            const contactPhone = booking.cleaners?.profiles?.phone;
            const wa = whatsappLink(
              contactPhone,
              `Merhaba ${cleanerName}, geçmiş temizlik randevumuz hakkında yazıyorum.`,
            );
            const phone = telLink(contactPhone);
            const existingReview = reviewByBooking.get(booking.id);

            return (
              <li
                key={booking.id}
                className="space-y-4 rounded-3xl border bg-card p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/cleaners/${booking.cleaner_id}`}
                      className="text-lg font-semibold hover:underline"
                    >
                      {cleanerName}
                    </Link>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-3.5" />
                      {booking.start_date}
                      {booking.start_time
                        ? ` · ${formatTime(booking.start_time)}`
                        : ""}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ev: {getHomeSizeLabel(booking.home_size)}
                      {booking.frequency && booking.frequency !== "once"
                        ? ` · ${getBookingFrequencyLabel(booking.frequency)}`
                        : ""}
                    </p>
                  </div>
                  <Badge
                    variant={
                      booking.status === "completed" ? "secondary" : "outline"
                    }
                    className="rounded-full"
                  >
                    {STATUS_LABELS[booking.status]}
                  </Badge>
                </div>

                {booking.notes ? (
                  <p className="text-sm text-muted-foreground">{booking.notes}</p>
                ) : null}

                {booking.status === "completed" && (wa || phone) ? (
                  <div className="flex flex-wrap gap-2">
                    {wa ? (
                      <Button
                        render={<a href={wa} target="_blank" rel="noreferrer" />}
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                      >
                        <MessageCircle className="size-4" />
                        WhatsApp
                      </Button>
                    ) : null}
                    {phone ? (
                      <Button
                        render={<a href={phone} />}
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                      >
                        Tekrar ara
                      </Button>
                    ) : null}
                    <Button
                      render={<Link href={`/cleaners/${booking.cleaner_id}`} />}
                      size="sm"
                      className="rounded-full"
                    >
                      Aynı personeli gör
                    </Button>
                  </div>
                ) : null}

                {booking.status === "completed" && !existingReview ? (
                  <ReviewForm
                    bookingId={booking.id}
                    cleanerId={booking.cleaner_id}
                  />
                ) : null}

                {existingReview ? (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    Puanınız: {existingReview.rating}/5
                    {existingReview.comment
                      ? ` — “${existingReview.comment}”`
                      : ""}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex justify-center">
        <Button render={<Link href="/bookings" />} variant="outline" className="rounded-full">
          Aktif randevulara dön
        </Button>
      </div>
    </div>
  );
}
