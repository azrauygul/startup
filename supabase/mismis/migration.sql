-- mismis: extends the Temizly schema (supabase/schema.sql) for the mobile app.
-- Run after schema.sql + storage.sql. Idempotent.

-- Cleaner profile fields -------------------------------------------------------
alter table public.cleaners
  add column if not exists prices jsonb not null default '{"1+1":2200,"2+1":2800,"3+1":3500,"4+1":4600}',
  add column if not exists cleaning_types text[] not null default '{genel}',
  add column if not exists rules jsonb not null default '{"noDogs":false,"noCats":false,"noPets":false,"other":""}',
  add column if not exists years_experience integer not null default 0,
  add column if not exists completed_jobs integer not null default 0,
  add column if not exists insurance_status text not null default 'yok'
    check (insurance_status in ('yok', 'inceleniyor', 'dogrulandi')),
  add column if not exists insurance_doc_path text,
  add column if not exists iyzico_sub_merchant_key text;

-- Standard price floor/ceiling per house size (docs/research.md §1.2).
create or replace function public.validate_cleaner_prices()
returns trigger language plpgsql as $$
begin
  if (new.prices->>'1+1')::numeric not between 1800 and 4000
    or (new.prices->>'2+1')::numeric not between 2200 and 5000
    or (new.prices->>'3+1')::numeric not between 2800 and 6500
    or (new.prices->>'4+1')::numeric not between 3800 and 8500 then
    raise exception 'Fiyatlar izin verilen aralığın dışında';
  end if;
  -- Only operations staff (service role) may mark insurance as verified.
  if new.insurance_status = 'dogrulandi'
    and (tg_op = 'INSERT' or old.insurance_status <> 'dogrulandi')
    and coalesce(auth.role(), 'service_role') <> 'service_role' then
    raise exception 'Sigorta doğrulaması yalnızca mismis ekibi tarafından yapılır';
  end if;
  return new;
end $$;

drop trigger if exists on_cleaner_prices on public.cleaners;
create trigger on_cleaner_prices before insert or update on public.cleaners
  for each row execute function public.validate_cleaner_prices();

-- Date-specific slots ----------------------------------------------------------
create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  cleaner_id uuid not null references public.cleaners (id) on delete cascade,
  slot_date date not null,
  template text not null,
  booked boolean not null default false,
  unique (cleaner_id, slot_date, template)
);
create index if not exists availability_slots_cleaner_date_idx on public.availability_slots (cleaner_id, slot_date);

alter table public.availability_slots enable row level security;

drop policy if exists "Slots readable" on public.availability_slots;
create policy "Slots readable" on public.availability_slots for select to authenticated using (true);

drop policy if exists "Cleaners manage own free slots" on public.availability_slots;
create policy "Cleaners manage own free slots" on public.availability_slots for all to authenticated
  using (not booked and exists (select 1 from public.cleaners c where c.id = cleaner_id and c.profile_id = auth.uid()))
  with check (not booked and exists (select 1 from public.cleaners c where c.id = cleaner_id and c.profile_id = auth.uid()));

-- Bookings: instant confirmation, questionnaire, package, money breakdown -------
alter table public.bookings
  add column if not exists slot_id uuid references public.availability_slots (id),
  add column if not exists slot_template text,
  add column if not exists answers jsonb not null default '{}',
  add column if not exists package_id text not null default 'tek',
  add column if not exists price jsonb,
  add column if not exists payment_id text;

-- Payments (written by the iyzico Edge Function with the service role) --------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  slot_id uuid not null references public.availability_slots (id),
  provider text not null default 'iyzico',
  token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  amount numeric(10,2) not null,
  payment_id text,
  payment_transaction_id text,
  draft jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;
drop policy if exists "Customers read own payments" on public.payments;
create policy "Customers read own payments" on public.payments for select to authenticated
  using (customer_id = auth.uid());

-- Atomically takes a free slot and creates a confirmed booking.
-- p_payment_token must reference a paid payment for the same slot and customer,
-- unless the token starts with 'mock-' and app.mock_payments is on (sandbox only).
create or replace function public.book_slot(
  p_slot_id uuid,
  p_answers jsonb,
  p_package_id text,
  p_price jsonb,
  p_payment_token text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  s public.availability_slots%rowtype;
  pay public.payments%rowtype;
  new_id uuid;
begin
  select * into s from public.availability_slots where id = p_slot_id for update;
  if not found or s.booked then
    raise exception 'Bu saat az önce doldu';
  end if;

  if p_payment_token like 'mock-%' and current_setting('app.mock_payments', true) = 'on' then
    null;
  else
    select * into pay from public.payments
      where token = p_payment_token and customer_id = auth.uid() and slot_id = p_slot_id and status = 'paid';
    if not found then
      raise exception 'Ödeme doğrulanamadı';
    end if;
  end if;

  update public.availability_slots set booked = true where id = s.id;
  insert into public.bookings (
    customer_id, cleaner_id, booking_type, start_date, status, notes,
    slot_id, slot_template, answers, package_id, price, payment_id
  ) values (
    auth.uid(), s.cleaner_id, 'daily', s.slot_date, 'confirmed', p_answers->>'notes',
    s.id, s.template, p_answers,
    coalesce(pay.draft->>'packageId', p_package_id),
    coalesce(pay.draft->'price', p_price),
    coalesce(pay.payment_id, p_payment_token)
  ) returning id into new_id;
  return new_id;
end $$;

grant execute on function public.book_slot(uuid, jsonb, text, jsonb, text) to authenticated;

-- Frees the slot when a booking is cancelled; counts completed jobs.
create or replace function public.on_booking_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' and new.slot_id is not null then
    update public.availability_slots set booked = false where id = new.slot_id;
  end if;
  if new.status = 'completed' and old.status <> 'completed' then
    update public.cleaners set completed_jobs = completed_jobs + 1 where id = new.cleaner_id;
  end if;
  return new;
end $$;

drop trigger if exists on_booking_status on public.bookings;
create trigger on_booking_status after update of status on public.bookings
  for each row execute function public.on_booking_status();

-- In-app chat per booking, filtered server-side as well ------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  sender_role user_role not null,
  body text not null check (char_length(body) between 1 and 1000),
  masked boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists messages_booking_idx on public.messages (booking_id, created_at);

create or replace function public.mask_contact_info(t text)
returns text language sql immutable as $$
  select regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(t,
          'T\s*R\s*\d{2}([\s-]*\d){10,}', '•••', 'gi'),
        '[[:alnum:]._%+-]+\s*@\s*[[:alnum:].-]+\.[a-z]{2,}', '•••', 'gi'),
      '(\+?\d[\s().-]*){9,}\d', '•••', 'g'),
    '(whats\s*app|vatsap|watsap|telegram|instagram|wa\.me|t\.me|https?://\S+)', '•••', 'gi')
$$;

create or replace function public.filter_message()
returns trigger language plpgsql as $$
declare
  cleaned text := public.mask_contact_info(new.body);
begin
  new.masked := new.masked or cleaned <> new.body;
  new.body := cleaned;
  return new;
end $$;

drop trigger if exists on_message_filter on public.messages;
create trigger on_message_filter before insert or update on public.messages
  for each row execute function public.filter_message();

alter table public.messages enable row level security;

drop policy if exists "Booking parties read messages" on public.messages;
create policy "Booking parties read messages" on public.messages for select to authenticated
  using (exists (
    select 1 from public.bookings b left join public.cleaners c on c.id = b.cleaner_id
    where b.id = booking_id and (b.customer_id = auth.uid() or c.profile_id = auth.uid())
  ));

drop policy if exists "Booking parties send messages" on public.messages;
create policy "Booking parties send messages" on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and exists (
    select 1 from public.bookings b left join public.cleaners c on c.id = b.cleaner_id
    where b.id = booking_id and b.status <> 'cancelled'
      and (b.customer_id = auth.uid() or c.profile_id = auth.uid())
  ));

-- The mobile app never collects or reads profiles.phone. The legacy web app still
-- selects profiles(*) and shows WhatsApp/phone links; once those are removed, lock it down with:
--   revoke select on public.profiles from authenticated;
--   grant select (id, full_name, role, avatar_url, created_at) on public.profiles to authenticated;

-- Private bucket for SGK / insurance documents ----------------------------------
insert into storage.buckets (id, name, public)
values ('insurance-docs', 'insurance-docs', false)
on conflict (id) do nothing;

drop policy if exists "Cleaners upload own insurance docs" on storage.objects;
create policy "Cleaners upload own insurance docs" on storage.objects for insert to authenticated
  with check (bucket_id = 'insurance-docs' and (storage.foldername(name))[1] = auth.uid()::text);
