import { BadgeCheck, Briefcase, Star } from "lucide-react";
import type { Cleaner } from "@/lib/types";

type Props = {
  cleaner: Cleaner;
  compact?: boolean;
};

export function CleanerTrustStats({ cleaner, compact = false }: Props) {
  const jobs = cleaner.completed_jobs_count ?? 0;
  const reviews = cleaner.review_count ?? 0;
  const rating = Number(cleaner.rating).toFixed(1);

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          {rating}
        </span>
        <span className="inline-flex items-center gap-1">
          <Briefcase className="size-3 text-primary" />
          {jobs} temizlik
        </span>
        <span>{reviews} yorum</span>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border bg-card/80 p-4 text-center">
        <Star className="mx-auto size-5 text-amber-500" />
        <p className="mt-2 text-2xl font-semibold tabular-nums">{rating}</p>
        <p className="text-xs text-muted-foreground">{reviews} değerlendirme</p>
      </div>
      <div className="rounded-2xl border bg-card/80 p-4 text-center">
        <Briefcase className="mx-auto size-5 text-primary" />
        <p className="mt-2 text-2xl font-semibold tabular-nums">{jobs}</p>
        <p className="text-xs text-muted-foreground">tamamlanan temizlik</p>
      </div>
      <div className="rounded-2xl border bg-card/80 p-4 text-center">
        <BadgeCheck className="mx-auto size-5 text-primary" />
        <p className="mt-2 text-sm font-semibold">Doğrulanmış profil</p>
        <p className="text-xs text-muted-foreground">mismis üzerinde aktif</p>
      </div>
    </div>
  );
}
