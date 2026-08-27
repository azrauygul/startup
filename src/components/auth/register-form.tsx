"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"customer" | "cleaner">("customer");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      action={(formData: FormData) => {
        formData.set("role", role);

        const fullName = String(formData.get("full_name") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");

        if (!fullName || !email || !password) {
          setError("Lütfen tüm zorunlu alanları doldurun.");
          return;
        }

        setError(null);

        startTransition(async () => {
          const result = await signUp(formData);
          if (result?.error) setError(result.error);
        });
      }}
    >
      <div className="space-y-2">
        <Label>Hesap türü</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["customer", "cleaner"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRole(option)}
              className={cn(
                "h-11 rounded-xl border text-sm font-medium transition-all",
                role === option
                  ? "border-primary bg-primary/10 text-primary font-semibold"
                  : "border-input bg-background hover:bg-accent text-muted-foreground",
              )}
            >
              {option === "customer" ? "Müşteri" : "Temizlik personeli"}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {role === "customer"
            ? "Kayıt sonrası personelleri Keşfet sayfasından inceleyebilirsiniz."
            : "Kayıt sonrası operasyon panelinde profil kartınızı oluşturursunuz."}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Ad soyad</Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          required
          autoComplete="name"
          placeholder="Adınız ve soyadınız"
          className="h-11 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="eposta@adresiniz.com"
          className="h-11 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Şifre</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="En az 6 karakter"
          className="h-11 rounded-xl"
        />
      </div>

      {error ? (
        <p className="text-sm font-medium text-destructive">{error}</p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-full"
      >
        {pending ? "Kayıt yapılıyor..." : "Kayıt ol"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Zaten hesabın var mı?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Giriş yap
        </Link>
      </p>
    </form>
  );
}
