import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { BrandIcon } from "@/components/brand/logo";
import { LegalFooterLinks } from "@/components/legal/legal-footer-links";
import { SetupBanner } from "@/components/setup-banner";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type SearchParams = Promise<{ role?: string; next?: string }>;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();
  const isCleaner = params.role === "cleaner";

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="animate-fade-up w-full max-w-md space-y-8 rounded-3xl border border-border/70 bg-card/90 p-8 shadow-sm backdrop-blur">
          <div className="space-y-3 text-center">
            <BrandIcon size="lg" className="mx-auto" />
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {isCleaner ? "Temizlikçi olarak katıl" : "mismis'e katıl"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isCleaner
                ? "Hesabını oluştur, operasyon panelinde profil kartını doldur ve Keşfet sayfasında görün."
                : "Randevu almak için hesap oluşturun. Personelleri kayıt olmadan da inceleyebilirsiniz."}
            </p>
          </div>
          <SetupBanner show={!configured} />
          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
      <footer className="border-t border-border/60 py-6">
        <LegalFooterLinks />
      </footer>
    </main>
  );
}
