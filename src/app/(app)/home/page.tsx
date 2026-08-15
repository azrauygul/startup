import Link from "next/link";
import { CalendarClock, Home, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const highlights = [
  {
    icon: Sparkles,
    title: "Günlük temizlik",
    text: "Tek seferlik ev temizliği için müsait personeli seçin.",
  },
  {
    icon: CalendarClock,
    title: "Aylık personel",
    text: "Düzenli temizlik için aylık kiralama talebi oluşturun.",
  },
  {
    icon: ShieldCheck,
    title: "Temiz evler",
    text: "Profil, puan ve yorumlara bakarak güvenle randevu oluşturun.",
  },
];

export default function AppHomePage() {
  return (
    <div className="animate-fade-up space-y-10 pb-4">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(160deg,var(--brand-soft),var(--background)_55%,oklch(0.97_0.02_185))] px-6 py-10 sm:px-10">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative max-w-xl space-y-5">
          <p className="font-heading text-sm font-semibold tracking-[0.18em] text-primary uppercase">
            mismis
            
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Ev, ofis veya bakıcı ihtiyaçlarınız için güvenilir personeller tek platformda.
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          Ev temizliğinden kurumsal ofislere, periyodik bakıcı desteğine kadar aradığınız uzmanı bulun. Profilleri inceleyin, değerlendirmeleri görün ve randevunuzu anında oluşturun.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button
              render={<Link href="/dashboard" />}
              size="lg"
              className="rounded-full px-8"
            >
              Randevu almak için tıklayın
            </Button>
            <Button
              render={<Link href="/bookings" />}
              size="lg"
              variant="outline"
              className="rounded-full px-8"
            >
              Randevularım
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {highlights.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-3xl border border-border/60 bg-card/80 p-5"
          >
            <span className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <h2 className="font-heading text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {text}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-dashed border-primary/25 bg-primary/5 px-6 py-8 text-center">
        <Home className="mx-auto size-8 text-primary" />
        <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight">
          Temiz evler, kolay randevu alma
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Keşfet sekmesinden temizlik personellerini özellikleriyle görün.
          Profile tıklayınca yorumlar, özel istekler ve müsait saatler açılır.
        </p>
        <Button
          render={<Link href="/dashboard" />}
          className="mt-5 rounded-full"
        >
          Temizlik personellerini gör
        </Button>
      </section>
    </div>
  );
}
