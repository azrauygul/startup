-- Tarih bazlı 2 haftalık müsaitlik penceresi
-- Supabase SQL Editor'de çalıştırın

alter table public.cleaner_availability
  add column if not exists available_date date;

alter table public.cleaner_availability
  alter column day_of_week drop not null;

drop index if exists availability_cleaner_date_idx;
create index availability_cleaner_date_idx
  on public.cleaner_availability (cleaner_id, available_date);

create unique index if not exists availability_cleaner_date_slot_idx
  on public.cleaner_availability (cleaner_id, available_date, start_time, end_time)
  where available_date is not null;
