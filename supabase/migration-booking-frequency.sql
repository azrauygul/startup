-- Tekrarlayan temizlik sıklığı (ödeme entegrasyonu öncesi bilgi amaçlı)
alter table public.bookings
  add column if not exists frequency text default 'once';

create index if not exists bookings_frequency_idx on public.bookings (frequency);
