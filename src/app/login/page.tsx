import { LoginForm } from "@/components/auth/login-form";
import { SetupBanner } from "@/components/setup-banner";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="animate-fade-up w-full max-w-md space-y-8 rounded-3xl border border-border/70 bg-card/90 p-8 shadow-sm backdrop-blur">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Temizly&apos;e giriş
          </h1>
          <p className="text-sm text-muted-foreground">
            Hesabına güvenle devam et.
          </p>
        </div>
        <SetupBanner show={!configured} />
        <LoginForm />
      </div>
    </main>
  );
}
