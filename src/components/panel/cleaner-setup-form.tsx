"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { AvatarUpload } from "@/components/panel/avatar-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelectChips } from "@/components/ui/multi-select-chips";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CLEANING_TYPES,
  DEFAULT_DAILY_RATE,
  DEFAULT_MONTHLY_RATE,
  MIN_DAILY_RATE,
  MIN_MONTHLY_RATE,
  TURKEY_CITIES,
} from "@/lib/constants";
import { getDistrictsForCity } from "@/lib/turkey-districts";
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
  hasProfile: boolean;
};

export function CleanerSetupForm({
  cleaner,
  availability,
  avatarUrl,
  hasProfile,
}: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [avatar, setAvatar] = useState(avatarUrl ?? "");
  const [city, setCity] = useState(cleaner?.city ?? "İzmir");
  const [serviceAreas, setServiceAreas] = useState<string[]>(
    cleaner?.service_areas ?? [],
  );
  const [services, setServices] = useState<string[]>(
    cleaner?.services_offered ?? [],
  );
  const [slots, setSlots] = useState<SlotDraft[]>(
    availability.length
      ? availability.map((a) => ({
          day_of_week: a.day_of_week,
          start_time: a.start_time.slice(0, 5),
          end_time: a.end_time.slice(0, 5),
        }))
      : [{ day_of_week: 1, start_time: "09:00", end_time: "17:00" }],
  );

  const districts = useMemo(() => getDistrictsForCity(city), [city]);

  useEffect(() => {
    setServiceAreas((prev) => prev.filter((d) => districts.includes(d)));
  }, [districts]);

  const handleSubmit = (formData: FormData) => {
    if (services.length === 0) {
      setMessage("En az bir temizlik türü seçin.");
      return;
    }
    if (serviceAreas.length === 0) {
      setMessage("En az bir ilçe / semt seçin.");
      return;
    }

    startTransition(async () => {
      const result = await ensureCleanerProfile({
        bio: String(formData.get("bio") ?? ""),
        dailyRate: Number(formData.get("daily_rate") ?? MIN_DAILY_RATE),
        monthlyRate: Number(formData.get("monthly_rate") ?? MIN_MONTHLY_RATE),
        services,
        serviceAreas,
        specialRequests: String(formData.get("special_requests") ?? ""),
        city,
        avatarUrl: avatar || undefined,
      });
      setMessage(result.error ?? result.success ?? null);
    });
  };

  return (
    <div className="space-y-8">
      <form
        className="space-y-5 rounded-3xl border bg-card p-5 sm:p-6"
        action={handleSubmit}
      >
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            {hasProfile ? "Profil kartını güncelle" : "Profil kartını oluştur"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Her personel yalnızca bir kart oluşturabilir. Bilgileriniz Keşfet
            sayfasında görünür.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Profil fotoğrafı</Label>
          <AvatarUpload value={avatar} onChange={setAvatar} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Biyografi</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={cleaner?.bio ?? ""}
            rows={3}
            required
            placeholder="Deneyiminiz, çalışma tarzınız ve hizmet verdiğiniz bölgeler..."
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="daily_rate">Günlük ücret (₺)</Label>
            <Input
              id="daily_rate"
              name="daily_rate"
              type="number"
              min={MIN_DAILY_RATE}
              step={50}
              defaultValue={cleaner?.daily_rate ?? DEFAULT_DAILY_RATE}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum {MIN_DAILY_RATE} ₺
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly_rate">Aylık ücret (₺)</Label>
            <Input
              id="monthly_rate"
              name="monthly_rate"
              type="number"
              min={MIN_MONTHLY_RATE}
              step={500}
              defaultValue={cleaner?.monthly_rate ?? DEFAULT_MONTHLY_RATE}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum {MIN_MONTHLY_RATE.toLocaleString("tr-TR")} ₺
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Şehir</Label>
          <Select value={city} onValueChange={(v) => v && setCity(String(v))}>
            <SelectTrigger className="h-11 w-full rounded-xl">
              <SelectValue placeholder="İl seçin" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {TURKEY_CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Hizmet verilecek ilçeler</Label>
          <MultiSelectChips
            options={districts}
            value={serviceAreas}
            onChange={setServiceAreas}
            emptyLabel="En az bir ilçe seçin"
          />
        </div>

        <div className="space-y-2">
          <Label>Temizlik türleri</Label>
          <MultiSelectChips
            options={CLEANING_TYPES}
            value={services}
            onChange={setServices}
            emptyLabel="En az bir temizlik türü seçin"
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
          {pending
            ? "Kaydediliyor..."
            : hasProfile
              ? "Kartı güncelle"
              : "Kartı oluştur"}
        </Button>
      </form>

      {cleaner ? (
        <div className="space-y-4 rounded-3xl border bg-card p-5 sm:p-6">
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
        <p
          className={`text-sm ${message.includes("kaydedildi") || message.includes("güncellendi") || message.includes("yüklendi") ? "text-primary" : "text-muted-foreground"}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
