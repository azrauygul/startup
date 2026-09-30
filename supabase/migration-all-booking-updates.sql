-- Randevu + müsaitlik: eksik sütunların tamamı
-- Supabase → SQL Editor → yapıştır → Run

-- bookings: ev büyüklüğü, saat, sıklık
alter table public.bookings
  add column if not exists home_size text;

alter table public.bookings
  add column if not exists start_time time;

alter table public.bookings
  add column if not exists frequency text default 'once';

-- cleaners: tamamlanan iş sayacı
alter table public.cleaners
  add column if not exists completed_jobs_count integer not null default 0;

-- cleaner_availability: tarih bazlı 14 gün penceresi
alter table public.cleaner_availability
  add column if not exists available_date date;

alter table public.cleaner_availability
  alter column day_of_week drop not null;

-- indeksler
create index if not exists bookings_home_size_idx on public.bookings (home_size);
create index if not exists bookings_frequency_idx on public.bookings (frequency);

create index if not exists bookings_cleaner_slot_idx
  on public.bookings (cleaner_id, start_date, start_time)
  where status in ('confirmed', 'pending');

create index if not exists availability_cleaner_date_idx
  on public.cleaner_availability (cleaner_id, available_date);

create unique index if not exists availability_cleaner_date_slot_idx
  on public.cleaner_availability (cleaner_id, available_date, start_time, end_time)
  where available_date is not null;

-- tamamlanan iş sayacı trigger (varsa günceller)
update public.cleaners c
set completed_jobs_count = coalesce((
  select count(*)::integer
  from public.bookings b
  where b.cleaner_id = c.id and b.status = 'completed'
), 0);

create or replace function public.refresh_cleaner_jobs_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
begin
  target := coalesce(new.cleaner_id, old.cleaner_id);
  update public.cleaners c
  set completed_jobs_count = (
    select count(*)::integer
    from public.bookings b
    where b.cleaner_id = target and b.status = 'completed'
  )
  where c.id = target;
  return coalesce(new, old);
end;
$$;

drop trigger if exists on_booking_jobs_count on public.bookings;
create trigger on_booking_jobs_count
  after insert or update of status or delete on public.bookings
  for each row execute function public.refresh_cleaner_jobs_count();

-- PostgREST şema önbelleğini yenile (Supabase API)
notify pgrst, 'reload schema';
