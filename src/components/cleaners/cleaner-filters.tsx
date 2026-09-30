"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BookingType } from "@/lib/types";

type Props = {
  services: string[];
};

export function CleanerFilters({ services }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const type = (searchParams.get("type") as BookingType) || "daily";
  const service = searchParams.get("service") || "all";
  const sort = searchParams.get("sort") || "rating";
  const qParam = searchParams.get("q") || "";
  const [q, setQ] = useState(qParam);

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
      startTransition(() => {
        router.push(`/dashboard?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  useEffect(() => {
    setQ(qParam);
  }, [qParam]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (q === qParam) return;
      update("q", q);
    }, 300);
    return () => clearTimeout(handle);
  }, [q, qParam, update]);

  return (
    <div className={`space-y-4 ${pending ? "opacity-70" : ""}`}>
      <Tabs
        value={type}
        onValueChange={(v) => update("type", String(v))}
        className="w-full"
      >
        <TabsList className="h-11 rounded-full bg-muted/80 p-1">
          <TabsTrigger value="daily" className="rounded-full px-5">
            Günlük
          </TabsTrigger>
          <TabsTrigger value="monthly" className="rounded-full px-5">
            Aylık
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            placeholder="İsim veya semt ara..."
            className="rounded-full pl-9"
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <Select
          value={service}
          onValueChange={(v) =>
            update("service", v == null ? "all" : String(v))
          }
        >
          <SelectTrigger className="w-full rounded-full">
            <SelectValue placeholder="Hizmet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm hizmetler</SelectItem>
            {services.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(v) =>
            update("sort", v == null ? "rating" : String(v))
          }
        >
          <SelectTrigger className="w-full rounded-full">
            <SelectValue placeholder="Sırala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">En yüksek puan</SelectItem>
            <SelectItem value="price_asc">Fiyat (artan)</SelectItem>
            <SelectItem value="price_desc">Fiyat (azalan)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
