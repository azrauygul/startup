import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { BrandIcon } from "@/components/brand/logo";
import { LegalFooterLinks } from "@/components/legal/legal-footer-links";
import { SetupBanner } from "@/components/setup-banner";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="animate-fade-up w-full max-w-md space-y-8 rounded-3xl border border-border/70 bg-card/90 p-8 shadow-sm backdrop-blur">
          <div className="space-y-3 text-center">
            <BrandIcon size="lg" className="mx-auto" />
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              mismis&apos;e giriş
            </h1>
            <p className="text-sm text-muted-foreground">
              Randevu almak için hesabınıza giriş yapın.
            </p>
          </div>
          <SetupBanner show={!configured} />
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
      <footer className="border-t border-border/60 py-6">
        <LegalFooterLinks />
      </footer>
    </main>
  );
}
