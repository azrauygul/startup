"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createBooking } from "@/lib/actions";
import { formatTRY } from "@/lib/format";
import type { BookingType, Cleaner } from "@/lib/types";

type Props = {
  cleaner: Cleaner;
  defaultType?: BookingType;
  isDemo?: boolean;
};

export function BookingRequestDialog({
  cleaner,
  defaultType = "daily",
  isDemo = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType =
    (searchParams.get("type") as BookingType | null) ?? defaultType;

  const [open, setOpen] = useState(false);
  const [bookingType, setBookingType] = useState<BookingType>(initialType);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const price = useMemo(() => {
    return bookingType === "daily"
      ? Number(cleaner.daily_rate)
      : Number(cleaner.monthly_rate);
  }, [bookingType, cleaner.daily_rate, cleaner.monthly_rate]);

  function submit() {
    if (isDemo) {
      setMessage(
        "Bu bir demo profil. Gerçek talep için Operasyon panelinden kayıtlı temizlikçi gerekir.",
      );
      return;
    }
    if (!startDate) {
      setMessage("Başlangıç tarihi seçin.");
      return;
    }
    if (bookingType === "monthly" && !endDate) {
      setMessage("Aylık kiralama için bitiş tarihi seçin.");
      return;
    }

    startTransition(async () => {
      const result = await createBooking({
        cleanerId: cleaner.id,
        bookingType,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
        notes,
      });

      if (result.error) {
        setMessage(result.error);
        return;
      }

      setOpen(false);
      router.push("/bookings");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="lg" className="w-full rounded-full sm:w-auto" />
        }
      >
        Kiralama Talebi Oluştur
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kiralama talebi</DialogTitle>
          <DialogDescription>
            Ödeme yok — talep oluşturulur, personel onaylar. Sonrasında WhatsApp
            ile iletişime geçebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Periyot</Label>
            <Select
              value={bookingType}
              onValueChange={(v) => {
                if (v === "daily" || v === "monthly") setBookingType(v);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">
                  Günlük — {formatTRY(Number(cleaner.daily_rate))}
                </SelectItem>
                <SelectItem value="monthly">
                  Aylık — {formatTRY(Number(cleaner.monthly_rate))}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Başlangıç tarihi</Label>
            <div className="rounded-2xl border p-2">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={{ before: new Date() }}
                locale={tr}
              />
            </div>
            {startDate ? (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarIcon className="size-3.5" />
                {format(startDate, "d MMMM yyyy", { locale: tr })}
              </p>
            ) : null}
          </div>

          {bookingType === "monthly" ? (
            <div className="space-y-2">
              <Label>Bitiş tarihi</Label>
              <div className="rounded-2xl border p-2">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={{ before: startDate ?? new Date() }}
                  locale={tr}
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="notes">Not (opsiyonel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adres, saat tercihi, özel istekler..."
              rows={3}
            />
          </div>

          <div className="rounded-2xl bg-muted/60 px-4 py-3 text-sm">
            Tahmini tutar: <span className="font-semibold">{formatTRY(price)}</span>
            <span className="text-muted-foreground"> (bilgi amaçlı, ödeme yok)</span>
          </div>

          {message ? (
            <p className="text-sm text-destructive">{message}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            className="rounded-full"
            disabled={pending}
            onClick={submit}
          >
            {pending ? "Gönderiliyor..." : "Talebi Gönder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
