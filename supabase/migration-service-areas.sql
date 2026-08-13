-- Run this in Supabase SQL Editor if cleaners table already exists

alter table public.cleaners
  add column if not exists service_areas text[] not null default '{}';

alter table public.cleaners
  add column if not exists special_requests text not null default '';

-- Optional: default city for new rows
alter table public.cleaners
  alter column city set default 'İzmir';
