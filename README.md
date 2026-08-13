# Temizly

Günlük / aylık temizlik personeli kiralama platformu (MVP).  
Stack: Next.js App Router, TypeScript, Tailwind, shadcn/ui, Supabase Auth + DB.  
Ödeme yok: talep → onay → WhatsApp / telefon.

## Kurulum

1. Bağımlılıklar

```bash
npm install
```

2. Ortam değişkenleri

```bash
cp .env.example .env.local
```

`.env.local` içine Supabase proje URL ve anon key değerlerini yazın.

3. Veritabanı

Supabase SQL Editor’de `supabase/schema.sql` dosyasını çalıştırın.

4. Geliştirme sunucusu

```bash
npm run dev
```

## Akış

- **Müşteri:** Kayıt → Keşfet → Personel detay → Kiralama talebi → Taleplerim
- **Personel:** Kayıt (temizlik personeli) → Operasyon paneli (profil + müsaitlik) → Talepleri onayla / tamamla
- **Değerlendirme:** Tamamlanan iş sonrası müşteri yıldız + yorum yazar
- **İletişim:** Onay sonrası WhatsApp / telefon deep link

## Deploy (0 TL)

- Frontend: Vercel (`.env` değişkenlerini ekleyin)
- Backend: Supabase free tier
