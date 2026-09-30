import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTRY } from "@/lib/format";
import type { BookingType, Cleaner } from "@/lib/types";

type Props = {
  cleaner: Cleaner;
  bookingType: BookingType;
};

export function CleanerCard({ cleaner, bookingType }: Props) {
  const name = cleaner.profiles?.full_name ?? "Temizlik Personeli";
  const avatar = cleaner.profiles?.avatar_url;
  const rate =
    bookingType === "daily" ? cleaner.daily_rate : cleaner.monthly_rate;
  const rateLabel = bookingType === "daily" ? "/ gün" : "/ ay";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const areas =
    cleaner.service_areas?.length > 0
      ? cleaner.service_areas.slice(0, 2).join(", ")
      : cleaner.city;
  const services = cleaner.services_offered ?? [];

  return (
    <Link
      href={`/cleaners/${cleaner.id}?type=${bookingType}`}
      className="group block rounded-3xl border border-border/70 bg-card p-4 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_40px_-24px_rgba(20,80,90,0.45)]"
    >
      <div className="flex gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--brand-soft),var(--muted))]">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt={name}
              className="size-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-lg font-semibold text-primary">
              {initials}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold tracking-tight">
                {name}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">
                  {cleaner.city} · {areas}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {Number(cleaner.rating).toFixed(1)}
            </div>
          </div>

          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {cleaner.bio || "Deneyimli temizlik personeli."}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {services.slice(0, 3).map((service) => (
              <Badge
                key={service}
                variant="secondary"
                className="rounded-full px-2 py-0 text-[11px] font-normal"
              >
                {service}
              </Badge>
            ))}
            {services.length > 3 ? (
              <Badge
                variant="outline"
                className="rounded-full px-2 py-0 text-[11px] font-normal"
              >
                +{services.length - 3}
              </Badge>
            ) : null}
          </div>

          <div className="flex items-end justify-between gap-2 pt-1">
            <p className="text-xs text-muted-foreground">
              {cleaner.review_count} değerlendirme
            </p>
            <p className="text-right">
              <span className="text-lg font-semibold tracking-tight">
                {formatTRY(Number(rate))}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">
                {rateLabel}
              </span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
