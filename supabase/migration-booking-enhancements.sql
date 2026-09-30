-- Ev büyüklüğü + tamamlanan iş sayacı
-- Supabase SQL Editor'de çalıştırın

alter table public.cleaners
  add column if not exists completed_jobs_count integer not null default 0;

alter table public.bookings
  add column if not exists home_size text;

create index if not exists bookings_home_size_idx on public.bookings (home_size);

-- Mevcut tamamlanan işlerden sayacı doldur
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
