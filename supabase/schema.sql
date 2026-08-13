-- Temizly MVP schema
-- Run in Supabase SQL Editor

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type user_role as enum ('customer', 'cleaner');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type booking_type as enum ('daily', 'monthly');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role user_role not null default 'customer',
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Cleaners
create table if not exists public.cleaners (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  bio text not null default '',
  rating numeric(3,2) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0,
  daily_rate numeric(10,2) not null check (daily_rate >= 0),
  monthly_rate numeric(10,2) not null check (monthly_rate >= 0),
  services_offered text[] not null default '{}',
  service_areas text[] not null default '{}',
  special_requests text not null default '',
  city text not null default 'İzmir',
  created_at timestamptz not null default now()
);

-- Availability (weekly recurring slots)
create table if not exists public.cleaner_availability (
  id uuid primary key default gen_random_uuid(),
  cleaner_id uuid not null references public.cleaners (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  check (end_time > start_time),
  unique (cleaner_id, day_of_week, start_time, end_time)
);

-- Bookings (no payment in MVP)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  cleaner_id uuid not null references public.cleaners (id) on delete cascade,
  booking_type booking_type not null,
  start_date date not null,
  end_date date,
  status booking_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  check (
    (booking_type = 'daily' and end_date is null)
    or (booking_type = 'monthly' and end_date is not null and end_date >= start_date)
  )
);

-- Reviews (only after completed booking)
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings (id) on delete cascade,
  cleaner_id uuid not null references public.cleaners (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists cleaners_city_idx on public.cleaners (city);
create index if not exists cleaners_rating_idx on public.cleaners (rating desc);
create index if not exists bookings_customer_idx on public.bookings (customer_id);
create index if not exists bookings_cleaner_idx on public.bookings (cleaner_id);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists reviews_cleaner_idx on public.reviews (cleaner_id);
create index if not exists availability_cleaner_idx on public.cleaner_availability (cleaner_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Recalculate cleaner rating
create or replace function public.refresh_cleaner_rating()
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
  set
    rating = coalesce((
      select round(avg(r.rating)::numeric, 2)
      from public.reviews r
      where r.cleaner_id = target
    ), 0),
    review_count = (
      select count(*)::integer from public.reviews r where r.cleaner_id = target
    )
  where c.id = target;
  return coalesce(new, old);
end;
$$;

drop trigger if exists on_review_change on public.reviews;
create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_cleaner_rating();

-- Only allow reviews for completed bookings owned by reviewer
create or replace function public.validate_review_booking()
returns trigger
language plpgsql
as $$
declare
  b public.bookings%rowtype;
begin
  select * into b from public.bookings where id = new.booking_id;
  if not found then
    raise exception 'Booking not found';
  end if;
  if b.status <> 'completed' then
    raise exception 'Reviews are only allowed for completed bookings';
  end if;
  if b.customer_id <> new.reviewer_id then
    raise exception 'Only the customer can review this booking';
  end if;
  if b.cleaner_id <> new.cleaner_id then
    raise exception 'Cleaner mismatch';
  end if;
  return new;
end;
$$;

drop trigger if exists on_review_validate on public.reviews;
create trigger on_review_validate
  before insert on public.reviews
  for each row execute function public.validate_review_booking();

-- RLS
alter table public.profiles enable row level security;
alter table public.cleaners enable row level security;
alter table public.cleaner_availability enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

-- Profiles policies
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Cleaners policies
drop policy if exists "Cleaners are publicly readable" on public.cleaners;
create policy "Cleaners are publicly readable"
  on public.cleaners for select
  to authenticated
  using (true);

drop policy if exists "Cleaners manage own row" on public.cleaners;
create policy "Cleaners manage own row"
  on public.cleaners for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Availability policies
drop policy if exists "Availability readable" on public.cleaner_availability;
create policy "Availability readable"
  on public.cleaner_availability for select
  to authenticated
  using (true);

drop policy if exists "Cleaners manage own availability" on public.cleaner_availability;
create policy "Cleaners manage own availability"
  on public.cleaner_availability for all
  to authenticated
  using (
    exists (
      select 1 from public.cleaners c
      where c.id = cleaner_id and c.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.cleaners c
      where c.id = cleaner_id and c.profile_id = auth.uid()
    )
  );

-- Bookings policies
drop policy if exists "Customers create bookings" on public.bookings;
create policy "Customers create bookings"
  on public.bookings for insert
  to authenticated
  with check (customer_id = auth.uid());

drop policy if exists "Customers see own bookings" on public.bookings;
create policy "Customers see own bookings"
  on public.bookings for select
  to authenticated
  using (
    customer_id = auth.uid()
    or exists (
      select 1 from public.cleaners c
      where c.id = cleaner_id and c.profile_id = auth.uid()
    )
  );

drop policy if exists "Customers cancel own pending" on public.bookings;
create policy "Customers cancel own pending"
  on public.bookings for update
  to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

drop policy if exists "Cleaners update booking status" on public.bookings;
create policy "Cleaners update booking status"
  on public.bookings for update
  to authenticated
  using (
    exists (
      select 1 from public.cleaners c
      where c.id = cleaner_id and c.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.cleaners c
      where c.id = cleaner_id and c.profile_id = auth.uid()
    )
  );

-- Reviews policies
drop policy if exists "Reviews are readable" on public.reviews;
create policy "Reviews are readable"
  on public.reviews for select
  to authenticated
  using (true);

drop policy if exists "Customers create reviews" on public.reviews;
create policy "Customers create reviews"
  on public.reviews for insert
  to authenticated
  with check (reviewer_id = auth.uid());

-- Seed helper note:
-- After creating cleaner accounts via Auth, insert into cleaners + cleaner_availability.
-- Example seed (replace UUIDs with real profile ids):
--
-- insert into public.cleaners (profile_id, bio, daily_rate, monthly_rate, services_offered, service_areas, special_requests, city, rating, review_count)
-- values
--   ('00000000-0000-0000-0000-000000000001', 'Deneyimli ev temizlik personeli.', 1200, 22000, array['Genel temizlik','Ütü','Mutfak'], array['Bornova','Bayraklı'], 'Malzeme evde olmalı.', 'İzmir', 4.8, 12);
