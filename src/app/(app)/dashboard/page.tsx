import { Suspense } from "react";
import { CleanerCard } from "@/components/cleaners/cleaner-card";
import { CleanerFilters } from "@/components/cleaners/cleaner-filters";
import { SetupBanner } from "@/components/setup-banner";
import { TURKEY_CITIES } from "@/lib/constants";
import { getDemoCleaners } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { BookingType, Cleaner } from "@/lib/types";

type SearchParams = Promise<{
  type?: string;
  service?: string;
  sort?: string;
  q?: string;
  city?: string;
}>;

function normalizeCleaner(raw: Cleaner): Cleaner {
  return {
    ...raw,
    services_offered: raw.services_offered ?? [],
    service_areas: raw.service_areas ?? [],
    special_requests: raw.special_requests ?? "",
  };
}

function filterCleaners(
  cleaners: Cleaner[],
  {
    city,
    service,
    q,
    bookingType,
    sort,
  }: {
    city?: string;
    service?: string;
    q?: string;
    bookingType: BookingType;
    sort: string;
  },
) {
  let result = cleaners;

  if (city && city !== "all") {
    result = result.filter((c) => c.city === city);
  }

  if (service && service !== "all") {
    result = result.filter((c) =>
      (c.services_offered ?? []).includes(service),
    );
  }

  if (q) {
    result = result.filter((c) => {
      const name = c.profiles?.full_name?.toLowerCase() ?? "";
      const areas = (c.service_areas ?? []).join(" ").toLowerCase();
      return (
        name.includes(q) ||
        c.city.toLowerCase().includes(q) ||
        areas.includes(q) ||
        c.bio.toLowerCase().includes(q)
      );
    });
  }

  if (sort === "price_asc") {
    result = [...result].sort((a, b) =>
      bookingType === "daily"
        ? Number(a.daily_rate) - Number(b.daily_rate)
        : Number(a.monthly_rate) - Number(b.monthly_rate),
    );
  } else if (sort === "price_desc") {
    result = [...result].sort((a, b) =>
      bookingType === "daily"
        ? Number(b.daily_rate) - Number(a.daily_rate)
        : Number(b.monthly_rate) - Number(a.monthly_rate),
    );
  } else {
    result = [...result].sort(
      (a, b) => Number(b.rating) - Number(a.rating),
    );
  }

  return result;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const bookingType = (params.type === "monthly" ? "monthly" : "daily") as BookingType;
  const service = params.service;
  const city = params.city;
  const sort = params.sort ?? "rating";
  const q = params.q?.trim().toLowerCase();

  const headingCity =
    city && city !== "all" ? `${city} temizlik personelleri` : "Türkiye geneli temizlik personelleri";

  if (!isSupabaseConfigured()) {
    const demo = filterCleaners(getDemoCleaners(), {
      city,
      service,
      q,
      bookingType,
      sort,
    });
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {headingCity}
          </h1>
          <SetupBanner show />
        </div>
        <Suspense fallback={null}>
          <CleanerFilters cities={[...TURKEY_CITIES]} />
        </Suspense>
        <div className="grid gap-4 sm:grid-cols-2">
          {demo.map((cleaner) => (
            <CleanerCard
              key={cleaner.id}
              cleaner={cleaner}
              bookingType={bookingType}
            />
          ))}
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  let query = supabase
    .from("cleaners")
    .select("*, profiles!cleaners_profile_id_fkey(*)");

  if (city && city !== "all") {
    query = query.eq("city", city);
  }

  if (service && service !== "all") {
    query = query.contains("services_offered", [service]);
  }

  if (sort === "price_asc") {
    query = query.order(bookingType === "daily" ? "daily_rate" : "monthly_rate", {
      ascending: true,
    });
  } else if (sort === "price_desc") {
    query = query.order(bookingType === "daily" ? "daily_rate" : "monthly_rate", {
      ascending: false,
    });
  } else {
    query = query.order("rating", { ascending: false });
  }

  const { data, error } = await query;
  let cleaners = ((data ?? []) as Cleaner[]).map(normalizeCleaner);

  if (!error && cleaners.length === 0 && !city && !service && !q) {
    cleaners = getDemoCleaners();
  }

  cleaners = filterCleaners(cleaners, {
    city,
    service,
    q,
    bookingType,
    sort,
  });

  const cities = Array.from(
    new Set([
      ...cleaners.map((c) => c.city),
      ...getDemoCleaners().map((c) => c.city),
    ]),
  ).sort((a, b) => {
    const priority = ["İstanbul", "Ankara", "İzmir"];
    const ai = priority.indexOf(a);
    const bi = priority.indexOf(b);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return a.localeCompare(b, "tr");
  });

  return (
    <div className="animate-fade-up space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {headingCity}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Türkiye&apos;nin 81 ilinden temizlik personellerini filtreleyin,
          profilleri inceleyin ve randevu oluşturun.
        </p>
      </div>

      <Suspense fallback={null}>
        <CleanerFilters cities={cities} />
      </Suspense>

      {error ? (
        <div className="space-y-4">
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm">
            Veritabanı okunamadı; demo listesi gösteriliyor.
            <p className="mt-2 text-muted-foreground">{error.message}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {filterCleaners(getDemoCleaners(), {
              city,
              service,
              q,
              bookingType,
              sort,
            }).map((cleaner, i) => (
              <div
                key={cleaner.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <CleanerCard cleaner={cleaner} bookingType={bookingType} />
              </div>
            ))}
          </div>
        </div>
      ) : cleaners.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-card/60 p-10 text-center">
          <p className="font-medium">Aramanıza uygun personel yok.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Filtreleri temizleyip tekrar deneyin.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cleaners.map((cleaner, i) => (
            <div
              key={cleaner.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <CleanerCard cleaner={cleaner} bookingType={bookingType} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
