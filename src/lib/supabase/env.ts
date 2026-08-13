export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
      anonKey &&
      !url.includes("your-project") &&
      anonKey !== "your-anon-key" &&
      url.startsWith("http"),
  );
}

export function getSupabaseEnv() {
  if (!isSupabaseConfigured()) return null;

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };
}

export const SUPABASE_SETUP_MESSAGE =
  "Supabase henüz bağlanmadı. Proje köküne .env.local ekleyip NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değerlerini yazın, ardından sunucuyu yeniden başlatın.";
