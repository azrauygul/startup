"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/actions";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"customer" | "cleaner">("cleaner");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      action={(formData: FormData) => {
        // Rol bilgisini explicit olarak ekliyoruz
        formData.set("role", role);

        // Zorunlu alan kontrolü (İstemci tarafı doğrulama)
        const fullName = formData.get("fullName") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

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
      {/* Hesap Türü Seçimi */}
      <div className="space-y-2">
        <Label>Hesap Türü</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`h-11 rounded-xl border text-sm font-medium transition-all ${
              role === "customer"
                ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold"
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
                ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold"
                : "border-input bg-background hover:bg-accent text-muted-foreground"
            }`}
          >
            Temizlik Personeli
          </button>
        </div>
      </div>

      {/* Ad Soyad */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Ad Soyad</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          required
          placeholder="Adınız ve soyadınız"
          className="h-11 rounded-xl"
        />
      </div>

      {/* E-posta */}
      <div className="space-y-2">
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="eposta@adresiniz.com"
          className="h-11 rounded-xl"
        />
      </div>

      {/* Şifre */}
      <div className="space-y-2">
        <Label htmlFor="password">Şifre</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="En az 6 karakter"
          className="h-11 rounded-xl"
        />
      </div>

      {/* Hata Mesajı */}
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

      {/* Submit Butonu */}
      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
      >
        {pending
          ? "Kayıt yapılıyor..."
          : role === "cleaner"
          ? "Personel Olarak Kaydol ve Devam Et"
          : "Kayıt Ol"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="font-medium text-emerald-700 underline-offset-4 hover:underline">
          Giriş yap
        </Link>
      </p>
    </form>
  );
}