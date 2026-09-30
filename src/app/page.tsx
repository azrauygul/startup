import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SetupBanner } from "@/components/setup-banner";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function HomePage() {
  const configured = isSupabaseConfigured();

  if (configured) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) redirect("/home");
    } catch {
      // show landing
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,var(--background)_70%),radial-gradient(ellipse_at_top,oklch(0.9_0.05_195),transparent_55%)]" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="font-heading text-xl font-semibold tracking-tight">
            Temizly
          </span>
        </div>
        <div className="flex gap-2">
          <Button render={<Link href="/login" />} variant="ghost" className="rounded-full">
            Giriş
          </Button>
          <Button render={<Link href="/register" />} className="rounded-full">
            Kayıt Ol
          </Button>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-8 px-4 pb-20 sm:px-6">
        {!configured ? (
          <div className="max-w-xl">
            <SetupBanner show />
          </div>
        ) : null}
        <div className="animate-fade-up max-w-2xl space-y-6">
          <p className="font-heading text-sm font-semibold tracking-[0.2em] text-primary uppercase">
            Temizly
          </p>
          <h1 className="font-heading text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Güvenilir temizlik personeli, günlük veya aylık.
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            Profili incele, müsaitliği gör, talep oluştur. Ödeme yok —
            personel onaylar, WhatsApp ile devam edersiniz.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button render={<Link href="/register" />} size="lg" className="rounded-full px-8">
              Hemen Başla
            </Button>
            <Button
              render={<Link href="/login" />}
              size="lg"
              variant="outline"
              className="rounded-full px-8"
            >
              Giriş Yap
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
