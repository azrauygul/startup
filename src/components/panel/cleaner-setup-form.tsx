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
  const [slots, setSlots] = useState<SlotDraft[]>(
    availability.length
      ? availability.map((a) => ({
          day_of_week: a.day_of_week,
          start_time: a.start_time.slice(0, 5),
          end_time: a.end_time.slice(0, 5),
        }))
      : [{ day_of_week: 1, start_time: "09:00", end_time: "17:00" }],
  );

  return (
    <div className="space-y-8">
      <form
        className="space-y-4 rounded-3xl border bg-card p-5"
        action={(formData) => {
          startTransition(async () => {
            const services = String(formData.get("services") ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            const areas = String(formData.get("service_areas") ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

            const result = await ensureCleanerProfile({
              bio: String(formData.get("bio") ?? ""),
              dailyRate: Number(formData.get("daily_rate") ?? 0),
              monthlyRate: Number(formData.get("monthly_rate") ?? 0),
              services,
              serviceAreas: areas,
              specialRequests: String(formData.get("special_requests") ?? ""),
              city: String(formData.get("city") ?? "İzmir"),
              avatarUrl: String(formData.get("avatar_url") ?? ""),
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
            defaultValue={avatarUrl ?? ""}
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
            defaultValue={cleaner?.bio ?? ""}
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
              defaultValue={cleaner?.daily_rate ?? 1000}
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
              defaultValue={cleaner?.monthly_rate ?? 20000}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Şehir</Label>
          <Input
            id="city"
            name="city"
            defaultValue={cleaner?.city ?? "İzmir"}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service_areas">Hizmet semtleri (virgülle ayır)</Label>
          <Input
            id="service_areas"
            name="service_areas"
            defaultValue={
              cleaner?.service_areas?.join(", ") ?? "Bornova, Bayraklı"
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="services">Tercih ettiği temizlikler (virgülle)</Label>
          <Input
            id="services"
            name="services"
            defaultValue={
              cleaner?.services_offered?.join(", ") ?? "Genel temizlik, Ütü"
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="special_requests">Özel istekler / kurallar</Label>
          <Textarea
            id="special_requests"
            name="special_requests"
            rows={3}
            defaultValue={cleaner?.special_requests ?? ""}
            placeholder="Örn: Malzeme evde olmalı, evcil hayvan varsa haber verin..."
          />
        </div>

        <Button type="submit" disabled={pending} className="rounded-full">
          Profili Kaydet
        </Button>
      </form>

      {cleaner ? (
        <div className="space-y-4 rounded-3xl border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Müsait gün / saat</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() =>
                setSlots((prev) => [
                  ...prev,
                  { day_of_week: 1, start_time: "09:00", end_time: "17:00" },
                ])
              }
            >
              Slot ekle
            </Button>
          </div>

          <div className="space-y-3">
            {slots.map((slot, index) => (
              <div
                key={`${slot.day_of_week}-${index}`}
                className="grid gap-2 rounded-2xl bg-muted/40 p-3 sm:grid-cols-4"
              >
                <select
                  className="h-10 rounded-xl border bg-background px-3 text-sm"
                  value={slot.day_of_week}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setSlots((prev) =>
                      prev.map((s, i) =>
                        i === index ? { ...s, day_of_week: value } : s,
                      ),
                    );
                  }}
                >
                  {DAY_LABELS.map((label, day) => (
                    <option key={label} value={day}>
                      {label}
                    </option>
                  ))}
                </select>
                <Input
                  type="time"
                  value={slot.start_time}
                  onChange={(e) =>
                    setSlots((prev) =>
                      prev.map((s, i) =>
                        i === index ? { ...s, start_time: e.target.value } : s,
                      ),
                    )
                  }
                />
                <Input
                  type="time"
                  value={slot.end_time}
                  onChange={(e) =>
                    setSlots((prev) =>
                      prev.map((s, i) =>
                        i === index ? { ...s, end_time: e.target.value } : s,
                      ),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setSlots((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  Sil
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            className="rounded-full"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await saveAvailability(
                  cleaner.id,
                  slots.map((s) => ({
                    ...s,
                    start_time: `${s.start_time}:00`,
                    end_time: `${s.end_time}:00`,
                  })),
                );
                setMessage(result.error ?? result.success ?? null);
              })
            }
          >
            Müsaitliği Kaydet
          </Button>
        </div>
      ) : null}

      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}
