import { RegisterForm }  from "@/components/auth/register-form";
import { BrandIcon } from "@/components/brand/logo";
import { SetupBanner } from "@/components/setup-banner";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function RegisterPage() {
  const configured = isSupabaseConfigured();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="animate-fade-up w-full max-w-md space-y-8 rounded-3xl border border-border/70 bg-card/90 p-8 shadow-sm backdrop-blur">
        <div className="space-y-3 text-center">
          <BrandIcon size="lg" className="mx-auto" />
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            mismis&apos;e katıl
          </h1>
          <p className="text-sm text-muted-foreground">
            Hesabını oluştur. Temizlik personeli isen profil kartını kayıttan
            sonra operasyon panelinde doldurursun.
          </p>
        </div>
        <SetupBanner show={!configured} />
        <RegisterForm />
      </div>
    </main>
  );
}
