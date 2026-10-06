# mismis — mobil uygulama (Android + iOS)

Güvenilir, sigortası kontrol edilmiş temizlikçilerle anında randevu. Expo SDK 57 + expo-router, Supabase.
Arayüz yaşlı kullanıcılar için tasarlandı: büyük yazı (20 px gövde), yüksek kontrast, en az 60 px dokunma alanı,
her düğmede yazı + simge.

## Telefonda çalıştırma

```bash
cd mobile
npm install
npx expo start
```

1. Telefona **Expo Go** uygulamasını kurun (App Store / Google Play).
2. Terminalde çıkan QR kodu okutun (iPhone: Kamera uygulaması, Android: Expo Go içinden).
   Telefon ve bilgisayar aynı Wi-Fi'da değilse: `npx expo start --tunnel`.
3. "Temizlik yaptırmak istiyorum" (müşteri) veya "Temizlikçiyim" ile demo hesabına girin.

Tarayıcıda önizleme: `npx expo start --web`. Mağaza derlemesi: `npx eas-cli@latest build -p android|ios`.

## Modlar

| Ortam değişkeni | Etki |
|---|---|
| *(yok)* | **Demo modu**: veriler telefonda (AsyncStorage) tutulur, örnek temizlikçiler ve randevular hazır gelir. |
| `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase'e bağlanır, e-posta ile giriş/kayıt. |
| `EXPO_PUBLIC_PAYMENTS=iyzico` | Gerçek iyzico Pazaryeri ödeme sayfası (WebView). Yoksa sandbox kart formu kullanılır. |

`.env.local` dosyasına yazın; Expo otomatik okur.

### Supabase kurulumu

1. SQL Editor'de sırasıyla: `supabase/schema.sql`, `supabase/storage.sql`, `supabase/mismis/migration.sql`,
   isteğe bağlı demo veri `supabase/mismis/seed.sql` (tüm hesapların şifresi `mismis123`).
2. Sahte ödemelerle denemek için: `alter database postgres set app.mock_payments = 'on';`
3. Gerçek ödeme: `supabase functions deploy iyzico-checkout` ve `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`,
   `IYZICO_BASE_URL` secret'larını ekleyin. Her temizlikçinin `cleaners.iyzico_sub_merchant_key` alanı
   (iyzico bireysel alt üye işyeri, TCKN + IBAN) dolu olmalıdır.

## Yapı

- `src/app/(musteri)` müşteri sekmeleri: Ana Sayfa, Keşfet, Randevularım, Hesabım
- `src/app/(temizlikci)` temizlikçi sekmeleri: İşlerim, Müsaitliğim, Profilim
- `src/app/rezervasyon/[cleanerId]` 4 adımlı randevu: gün/saat → ev soruları → paket → özet ve ödeme
- `src/config/` fiyat bantları ve komisyon (`pricing.ts`), randevu soruları (`questionnaire.ts`), saat dilimleri (`slots.ts`)
- `src/data/` `Repository` arayüzü, demo (`mock-repository.ts`) ve Supabase (`supabase-repository.ts`) uygulamaları
- `src/payments/` `PaymentProvider` arayüzü, iyzico sandbox taklidi ve gerçek iyzico (Edge Function üzerinden)
- `src/lib/contact-filter.ts` telefon, IBAN, e-posta, WhatsApp/Instagram ve yazıyla yazılmış numaraları gizler

## Kontroller

```bash
npm test          # fiyat/komisyon ve iletişim filtresi testleri
npx tsc --noEmit
npx expo lint
```

`src/config/pricing.ts` değişirse `npm run sync:pricing` ile Edge Function kopyasını güncelleyin (test kontrol eder).
