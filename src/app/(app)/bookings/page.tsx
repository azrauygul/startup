import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/bookings/review-form";
import { BookingStatusActions } from "@/components/bookings/booking-status-actions";
import { SetupBanner } from "@/components/setup-banner";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentProfile } from "@/lib/helpers";
import { telLink, whatsappLink } from "@/lib/format";
import { STATUS_LABELS, type Booking, type Cleaner, type Review } from "@/lib/types";

export default async function BookingsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Randevularım
        </h1>
        <SetupBanner show />
      </div>
    );
  }

  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const isCleaner = profile?.role === "cleaner";

  let list: Booking[] = [];

  if (isCleaner && profile) {
    const { data: cleaner } = await supabase
      .from("cleaners")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (cleaner) {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*, cleaners(*, profiles(*)), profiles(*)")
        .eq("cleaner_id", (cleaner as Cleaner).id)
        .order("created_at", { ascending: false });
      list = (bookings ?? []) as Booking[];
    }
  } else if (profile) {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*, cleaners(*, profiles(*)), profiles(*)")
      .eq("customer_id", profile.id)
      .order("created_at", { ascending: false });
    list = (bookings ?? []) as Booking[];
  }

  const bookingIds = list.map((b) => b.id);
  const { data: reviews } = bookingIds.length
    ? await supabase.from("reviews").select("*").in("booking_id", bookingIds)
    : { data: [] as Review[] };

  const reviewByBooking = new Map(
    ((reviews ?? []) as Review[]).map((r) => [r.booking_id, r]),
  );

  return (
    <div className="animate-fade-up space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Randevularım
        </h1>
        <p className="text-muted-foreground">
          {isCleaner
            ? "Gelen talepleri görün, onaylayın veya reddedin."
            : "Taleplerinizi takip edin, onay sonrası iletişime geçin."}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-card/60 p-10 text-center">
          <p className="font-medium">Henüz randevu yok.</p>
          {!isCleaner ? (
            <Button
              render={<Link href="/dashboard" />}
              className="mt-4 rounded-full"
            >
              Temizlikçileri gör
            </Button>
          ) : (
            <Button
              render={<Link href="/panel" />}
              className="mt-4 rounded-full"
            >
              Profilini tamamla
            </Button>
          )}
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((booking) => {
            const cleanerName =
              booking.cleaners?.profiles?.full_name ?? "Personel";
            const customerName = booking.profiles?.full_name ?? "Müşteri";
            const displayName = isCleaner ? customerName : cleanerName;
            const contactPhone = isCleaner
              ? booking.profiles?.phone
              : booking.cleaners?.profiles?.phone;
            const wa = whatsappLink(
              contactPhone,
              isCleaner
                ? `Merhaba ${customerName}, mismis talebiniz hakkında yazıyorum.`
                : `Merhaba ${cleanerName}, mismis üzerinden oluşturduğum kiralama talebi hakkında yazıyorum.`,
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
                    {isCleaner ? (
                      <p className="text-lg font-semibold">{displayName}</p>
                    ) : (
                      <Link
                        href={`/cleaners/${booking.cleaner_id}`}
                        className="text-lg font-semibold hover:underline"
                      >
                        {displayName}
                      </Link>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {booking.booking_type === "daily" ? "Günlük" : "Aylık"} ·{" "}
                      {booking.start_date}
                      {booking.end_date ? ` → ${booking.end_date}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant={
                      booking.status === "completed"
                        ? "secondary"
                        : booking.status === "cancelled"
                          ? "outline"
                          : "default"
                    }
                    className="rounded-full"
                  >
                    {STATUS_LABELS[booking.status]}
                  </Badge>
                </div>

                {booking.notes ? (
                  <p className="text-sm text-muted-foreground">{booking.notes}</p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {isCleaner && booking.status === "pending" ? (
                    <BookingStatusActions
                      bookingId={booking.id}
                      actions={[
                        { label: "Onayla", status: "confirmed" },
                        {
                          label: "Reddet",
                          status: "cancelled",
                          variant: "outline",
                        },
                      ]}
                    />
                  ) : null}

                  {isCleaner && booking.status === "confirmed" ? (
                    <BookingStatusActions
                      bookingId={booking.id}
                      actions={[
                        {
                          label: "Tamamlandı işaretle",
                          status: "completed",
                        },
                        {
                          label: "İptal",
                          status: "cancelled",
                          variant: "outline",
                        },
                      ]}
                    />
                  ) : null}

                  {!isCleaner && booking.status === "pending" ? (
                    <BookingStatusActions
                      bookingId={booking.id}
                      actions={[
                        {
                          label: "İptal et",
                          status: "cancelled",
                          variant: "outline",
                        },
                      ]}
                    />
                  ) : null}

                  {(booking.status === "confirmed" ||
                    booking.status === "completed") &&
                  (wa || phone) ? (
                    <>
                      {wa ? (
                        <Button
                          render={
                            <a href={wa} target="_blank" rel="noreferrer" />
                          }
                          size="sm"
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
                          <Phone className="size-4" />
                          Ara
                        </Button>
                      ) : null}
                    </>
                  ) : null}
                </div>

                {!isCleaner &&
                booking.status === "completed" &&
                !existingReview ? (
                  <ReviewForm
                    bookingId={booking.id}
                    cleanerId={booking.cleaner_id}
                  />
                ) : null}

                {!isCleaner && existingReview ? (
                  <p className="text-sm text-muted-foreground">
                    Değerlendirmeniz: {existingReview.rating}/5
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
    </div>
  );
}
