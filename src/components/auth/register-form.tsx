"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/actions";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"customer" | "cleaner">("customer");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        startTransition(async () => {
          // Rol bilgisini Server Action'a aktarıyoruz
          formData.append("role", role);
          const result = await signUp(formData);
          if (result?.error) setError(result.error);
        });
      }}
    >
      {/* Rol Seçim Butonları */}
      <div className="space-y-2">
        <Label>Hesap Türü</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`h-11 rounded-xl border text-sm font-medium transition-all ${
              role === "customer"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-input bg-background hover:bg-accent text-muted-foreground"
            }`}
          >
            Müşteri (Hizmet Al)
          </button>
          <button
            type="button"
            onClick={() => setRole("cleaner")}
            className={`h-11 rounded-xl border text-sm font-medium transition-all ${
              role === "cleaner"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-input bg-background hover:bg-accent text-muted-foreground"
            }`}
          >
            Temizlik Personeli
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Ad Soyad</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          required
          placeholder="Ahmet Yılmaz"
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
          placeholder="ornek@mail.com"
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
          className="h-11 rounded-xl"
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" className="h-11 w-full rounded-full" disabled={pending}>
        {pending
          ? "Kayıt yapılıyor..."
          : role === "cleaner"
          ? "Personel Olarak Kaydol ve Devam Et"
          : "Kayıt Ol"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Giriş yap
        </Link>
      </p>
    </form>
  );
}