import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingStatusActions } from "@/components/bookings/booking-status-actions";
import { CleanerSetupForm } from "@/components/panel/cleaner-setup-form";
import { SetupBanner } from "@/components/setup-banner";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentProfile } from "@/lib/helpers";
import { telLink, whatsappLink } from "@/lib/format";
import {
  STATUS_LABELS,
  type Booking,
  type Cleaner,
  type CleanerAvailability,
} from "@/lib/types";

export default async function PanelPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Operasyon paneli
        </h1>
        <SetupBanner show />
      </div>
    );
  }

  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "cleaner") {
    return (
      <div className="rounded-3xl border bg-card p-8 text-center">
        <h1 className="font-heading text-2xl font-semibold">Operasyon paneli</h1>
        <p className="mt-2 text-muted-foreground">
          Bu alan yalnızca temizlik personeli hesapları içindir.
        </p>
        <Button render={<Link href="/home" />} className="mt-4 rounded-full">
          Home’a dön
        </Button>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: cleaner } = await supabase
    .from("cleaners")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  const typedCleaner = cleaner as Cleaner | null;

  const { data: availability } = typedCleaner
    ? await supabase
        .from("cleaner_availability")
        .select("*")
        .eq("cleaner_id", typedCleaner.id)
        .order("day_of_week")
    : { data: [] };

  const { data: bookings } = typedCleaner
    ? await supabase
        .from("bookings")
        .select("*, profiles(*)")
        .eq("cleaner_id", typedCleaner.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const list = (bookings ?? []) as Booking[];

  return (
    <div className="animate-fade-up space-y-10">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Operasyon paneli
        </h1>
        <p className="text-muted-foreground">
          Profil ve müsaitlik yönetin, gelen talepleri onaylayın, müşteriyle
          iletişime geçin.
        </p>
      </div>

      <CleanerSetupForm
        cleaner={
          typedCleaner
            ? {
                ...typedCleaner,
                services_offered: typedCleaner.services_offered ?? [],
                service_areas: typedCleaner.service_areas ?? [],
                special_requests: typedCleaner.special_requests ?? "",
              }
            : null
        }
        availability={(availability ?? []) as CleanerAvailability[]}
        avatarUrl={profile.avatar_url}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Gelen talepler</h2>
        {!typedCleaner ? (
          <p className="text-sm text-muted-foreground">
            Önce profilinizi kaydedin; ardından talepler burada görünür.
          </p>
        ) : list.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Henüz talep yok.
          </div>
        ) : (
          <ul className="space-y-4">
            {list.map((booking) => {
              const customerName = booking.profiles?.full_name ?? "Müşteri";
              const customerPhone = booking.profiles?.phone;
              const wa = whatsappLink(
                customerPhone,
                `Merhaba ${customerName}, Temizly kiralama talebiniz hakkında yazıyorum.`,
              );
              const phone = telLink(customerPhone);

              return (
                <li
                  key={booking.id}
                  className="space-y-4 rounded-3xl border bg-card p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">{customerName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {booking.booking_type === "daily" ? "Günlük" : "Aylık"} ·{" "}
                        {booking.start_date}
                        {booking.end_date ? ` → ${booking.end_date}` : ""}
                      </p>
                      {booking.notes ? (
                        <p className="mt-2 text-sm">{booking.notes}</p>
                      ) : null}
                    </div>
                    <Badge className="rounded-full">
                      {STATUS_LABELS[booking.status]}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {booking.status === "pending" ? (
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

                    {booking.status === "confirmed" ? (
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

                    {(booking.status === "confirmed" ||
                      booking.status === "completed") &&
                    (wa || phone) ? (
                      <>
                        {wa ? (
                          <Button
                            render={<a href={wa} target="_blank" rel="noreferrer" />}
                            size="sm"
                            variant="secondary"
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
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
