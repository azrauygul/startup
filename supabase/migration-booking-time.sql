-- Randevu saati (TaskRabbit tarzı slot rezervasyonu)
-- Supabase SQL Editor'de çalıştırın

alter table public.bookings
  add column if not exists start_time time;

create index if not exists bookings_cleaner_slot_idx
  on public.bookings (cleaner_id, start_date, start_time)
  where status in ('confirmed', 'pending');
