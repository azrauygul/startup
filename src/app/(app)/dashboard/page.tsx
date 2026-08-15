import { Suspense } from "react";
import { CleanerCard } from "@/components/cleaners/cleaner-card";
import { CleanerFilters } from "@/components/cleaners/cleaner-filters";
import { SetupBanner } from "@/components/setup-banner";
import { getDemoCleaners } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { BookingType, Cleaner } from "@/lib/types";

type SearchParams = Promise<{
  type?: string;
  service?: string;
  sort?: string;
  q?: string;
}>;

function normalizeCleaner(raw: Cleaner): Cleaner {
  return {
    ...raw,
    services_offered: raw.services_offered ?? [],
    service_areas: raw.service_areas ?? [],
    special_requests: raw.special_requests ?? "",
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const bookingType = (params.type === "monthly" ? "monthly" : "daily") as BookingType;
  const service = params.service;
  const sort = params.sort ?? "rating";
  const q = params.q?.trim().toLowerCase();

  if (!isSupabaseConfigured()) {
    const demo = getDemoCleaners();
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Temizlik Personelleri
          </h1>
          <SetupBanner show />
        </div>
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

  let query = supabase.from("cleaners").select("*, profiles(*)");

  if (service) query = query.contains("services_offered", [service]);

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

  // DB boşsa İzmir demo personelleri göster (kartların görünmesi için)
  if (!error && cleaners.length === 0) {
    cleaners = getDemoCleaners();
  }

  if (service) {
    cleaners = cleaners.filter((c) =>
      (c.services_offered ?? []).includes(service),
    );
  }

  if (q) {
    cleaners = cleaners.filter((c) => {
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
    cleaners = [...cleaners].sort((a, b) =>
      bookingType === "daily"
        ? Number(a.daily_rate) - Number(b.daily_rate)
        : Number(a.monthly_rate) - Number(b.monthly_rate),
    );
  } else if (sort === "price_desc") {
    cleaners = [...cleaners].sort((a, b) =>
      bookingType === "daily"
        ? Number(b.daily_rate) - Number(a.daily_rate)
        : Number(b.monthly_rate) - Number(a.monthly_rate),
    );
  } else {
    cleaners = [...cleaners].sort(
      (a, b) => Number(b.rating) - Number(a.rating),
    );
  }

  const services = Array.from(
    new Set([
      ...cleaners.flatMap((c) => c.services_offered ?? []),
      ...getDemoCleaners().flatMap((c) => c.services_offered),
    ]),
  ).sort();

  return (
    <div className="animate-fade-up space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          İzmir temizlikçileri
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Karttaki özelliklere bakın, tıklayınca detay, yorum ve müsait saatleri görün.
        </p>
      </div>

      <Suspense fallback={null}>
        <CleanerFilters services={services} />
      </Suspense>

      {error ? (
        <div className="space-y-4">
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm">
            Veritabanı okunamadı; demo listesi gösteriliyor.
            <p className="mt-2 text-muted-foreground">{error.message}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {getDemoCleaners().map((cleaner, i) => (
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
