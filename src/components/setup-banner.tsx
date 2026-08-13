import { SUPABASE_SETUP_MESSAGE } from "@/lib/supabase/env";

export function SetupBanner({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-medium">Kurulum gerekli</p>
      <p className="mt-1 text-amber-900/80">{SUPABASE_SETUP_MESSAGE}</p>
      <ol className="mt-2 list-decimal space-y-1 pl-4 text-amber-900/80">
        <li>
          <code className="rounded bg-white/70 px-1">.env.example</code> dosyasını{" "}
          <code className="rounded bg-white/70 px-1">.env.local</code> olarak kopyala
        </li>
        <li>Supabase URL ve anon key değerlerini yapıştır</li>
        <li>
          Supabase SQL Editor’de{" "}
          <code className="rounded bg-white/70 px-1">supabase/schema.sql</code> çalıştır
        </li>
        <li>
          <code className="rounded bg-white/70 px-1">npm run dev</code> ile sunucuyu yeniden başlat
        </li>
      </ol>
    </div>
  );
}
