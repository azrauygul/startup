"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ensureCleanerProfile, saveAvailability } from "@/lib/actions";
import { DAY_LABELS } from "@/lib/types";
import type { Cleaner, CleanerAvailability } from "@/lib/types";

type SlotDraft = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type Props = {
  cleaner: Cleaner | null;
  availability: CleanerAvailability[];
  avatarUrl?: string | null;
};

export function CleanerSetupForm({
  cleaner,
  availability,
  avatarUrl,
}: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // 1. Form state'i oluşturup başlangıç değerlerini aktarıyoruz
  const [formData, setFormData] = useState({
    avatar_url: avatarUrl ?? "",
    bio: cleaner?.bio ?? "",
    daily_rate: cleaner?.daily_rate ?? 1000,
    monthly_rate: cleaner?.monthly_rate ?? 20000,
    city: cleaner?.city ?? "İzmir",
    service_areas: cleaner?.service_areas?.join(", ") ?? "Bornova, Bayraklı",
    services: cleaner?.services_offered?.join(", ") ?? "Genel temizlik, Ütü",
    special_requests: cleaner?.special_requests ?? "",
  });

  const [slots, setSlots] = useState<SlotDraft[]>(
    availability.length
      ? availability.map((a) => ({
          day_of_week: a.day_of_week,
          start_time: a.start_time.slice(0, 5),
          end_time: a.end_time.slice(0, 5),
        }))
      : [{ day_of_week: 1, start_time: "09:00", end_time: "17:00" }],
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="space-y-8">
      <form
        className="space-y-4 rounded-3xl border bg-card p-5"
        action={() => {
          startTransition(async () => {
            const services = formData.services
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            const areas = formData.service_areas
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

            const result = await ensureCleanerProfile({
              bio: formData.bio,
              dailyRate: Number(formData.daily_rate ?? 0),
              monthlyRate: Number(formData.monthly_rate ?? 0),
              services,
              serviceAreas: areas,
              specialRequests: formData.special_requests,
              city: formData.city || "İzmir",
              avatarUrl: formData.avatar_url,
            });
            setMessage(result.error ?? result.success ?? null);
          });
        }}
      >
        <h2 className="text-lg font-semibold">Profil bilgileri</h2>

        <div className="space-y-2">
          <Label htmlFor="avatar_url">Profil fotoğrafı URL</Label>
          <Input
            id="avatar_url"
            name="avatar_url"
            type="url"
            placeholder="https://..."
            value={formData.avatar_url}
            onChange={handleChange}
          />
          <p className="text-xs text-muted-foreground">
            Geçici olarak görsel linki yapıştırın (Unsplash vb.).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Biyografi</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            required
            placeholder="Deneyiminiz ve hizmet verdiğiniz bölgeler..."
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="daily_rate">Günlük ücret (₺)</Label>
            <Input
              id="daily_rate"
              name="daily_rate"
              type="number"
              min={0}
              value={formData.daily_rate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly_rate">Aylık ücret (₺)</Label>
            <Input
              id="monthly_rate"
              name="monthly_rate"
              type="number"
              min={0}
              value={formData.monthly_rate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Şehir</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service_areas">Hizmet semtleri (virgülle ayır)</Label>
          <Input
            id="service_areas"
            name="service_areas"
            value={formData.service_areas}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="services">Tercih ettiği temizlikler (virgülle)</Label>
          <Input
            id="services"
            name="services"
            value={formData.services}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="special_requests">Özel istekler / kurallar</Label>
          <Textarea
            id="special_requests"
            name="special_requests"
            rows={3}
            value={formData.special_requests}
            onChange={handleChange}
            placeholder="Örn: Malzeme evde olmalı, evcil hayvan varsa haber verin..."
          />
        </div>

        <Button type="submit" disabled={pending} className="rounded-full">
          Profili Kaydet
        </Button>
      </form>

      {/* Müsaitlik alanları aynı şekilde devam eder... */}
    </div>
  );
}
