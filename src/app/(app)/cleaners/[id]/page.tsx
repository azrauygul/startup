import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Clock, MapPin, MessageSquareWarning, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookingRequestDialog } from "@/components/cleaners/booking-request-dialog";
import { SetupBanner } from "@/components/setup-banner";
import {
  getDemoCleanerBundle,
  isDemoCleanerId,
} from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatTime, formatTRY } from "@/lib/format";
import {
  DAY_LABELS,
  type BookingType,
  type Cleaner,
  type CleanerAvailability,
  type Review,
} from "@/lib/types";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ type?: string }>;

export default async function CleanerDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const bookingType = (sp.type === "monthly" ? "monthly" : "daily") as BookingType;

  if (isDemoCleanerId(id)) {
    const demo = getDemoCleanerBundle(id);
    if (!demo) notFound();
    return (
      <CleanerDetailView
        cleaner={demo.cleaner}
        slots={demo.availability}
        reviews={demo.reviews}
        bookingType={bookingType}
        isDemo
      />
    );
  }

  if (!isSupabaseConfigured()) {
    return <SetupBanner show />;
  }

  const supabase = await createClient();

  const { data: cleaner } = await supabase
    .from("cleaners")
    .select("*, profiles(*)")
    .eq("id", id)
    .maybeSingle();

  if (!cleaner) notFound();

  const typed = {
    ...(cleaner as Cleaner),
    services_offered: (cleaner as Cleaner).services_offered ?? [],
    service_areas: (cleaner as Cleaner).service_areas ?? [],
    special_requests: (cleaner as Cleaner).special_requests ?? "",
  };

  const [{ data: availability }, { data: reviews }] = await Promise.all([
    supabase
      .from("cleaner_availability")
      .select("*")
      .eq("cleaner_id", id)
      .order("day_of_week")
      .order("start_time"),
    supabase
      .from("reviews")
      .select("*, profiles(*)")
      .eq("cleaner_id", id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <CleanerDetailView
      cleaner={typed}
      slots={(availability ?? []) as CleanerAvailability[]}
      reviews={(reviews ?? []) as Review[]}
      bookingType={bookingType}
      isDemo={false}
    />
  );
}

function CleanerDetailView({
  cleaner,
  slots,
  reviews,
  bookingType,
  isDemo,
}: {
  cleaner: Cleaner;
  slots: CleanerAvailability[];
  reviews: Review[];
  bookingType: BookingType;
  isDemo: boolean;
}) {
  const name = cleaner.profiles?.full_name ?? "Temizlik Personeli";
  const avatar = cleaner.profiles?.avatar_url;
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const areas =
    cleaner.service_areas?.length > 0
      ? cleaner.service_areas
      : [cleaner.city];

  return (
    <div className="animate-fade-up space-y-8">
      <div className="overflow-hidden rounded-3xl border bg-card">
        <div className="h-36 bg-[linear-gradient(135deg,var(--brand-soft),oklch(0.97_0.01_200))] sm:h-40" />
        <div className="space-y-5 px-5 pb-6 -mt-12 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <div className="size-24 overflow-hidden rounded-3xl border-4 border-card bg-background shadow-sm">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt={name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-2xl font-semibold text-primary">
                    {initials}
                  </div>
                )}
              </div>
              <div>
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                  {name}
                </h1>
                <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {cleaner.city}
                  </span>
                  <span className="inline-flex items-center gap-1 text-amber-600">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    {Number(cleaner.rating).toFixed(1)} ({cleaner.review_count})
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <div className="text-sm text-muted-foreground">
                Günlük{" "}
                <span className="font-semibold text-foreground">
                  {formatTRY(Number(cleaner.daily_rate))}
                </span>
                <span className="mx-2">·</span>
                Aylık{" "}
                <span className="font-semibold text-foreground">
                  {formatTRY(Number(cleaner.monthly_rate))}
                </span>
              </div>
              <Suspense fallback={null}>
                <BookingRequestDialog
                  cleaner={cleaner}
                  defaultType={bookingType}
                  isDemo={isDemo}
                />
              </Suspense>
            </div>
          </div>

          <p className="max-w-3xl leading-relaxed text-muted-foreground">
            {cleaner.bio}
          </p>

          <div>
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Hizmet verdiği semtler
            </p>
            <div className="flex flex-wrap gap-2">
              {areas.map((area) => (
                <Badge key={area} variant="outline" className="rounded-full">
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Tercih ettiği temizlikler
            </p>
            <div className="flex flex-wrap gap-2">
              {cleaner.services_offered.map((service) => (
                <Badge key={service} variant="secondary" className="rounded-full">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {cleaner.special_requests ? (
        <section className="space-y-3 rounded-3xl border border-amber-200/70 bg-amber-50/50 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <MessageSquareWarning className="size-4 text-amber-700" />
            Özel istekler
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {cleaner.special_requests}
          </p>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-3xl border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="size-4 text-primary" />
            Müsait gün ve saatler
          </h2>
          {slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Henüz müsaitlik eklenmemiş.
            </p>
          ) : (
            <ul className="space-y-2">
              {slots.map((slot) => (
                <li
                  key={slot.id}
                  className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3 text-sm"
                >
                  <span className="font-medium">
                    {DAY_LABELS[slot.day_of_week]}
                  </span>
                  <span className="text-muted-foreground">
                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4 rounded-3xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Değerlendirmeler</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Henüz yorum yok.
            </p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li key={review.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">
                      {review.profiles?.full_name ?? "Müşteri"}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm text-amber-600">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {review.rating}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {review.comment || "Yorum yok."}
                  </p>
                  <Separator />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
