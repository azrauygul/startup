-- Optional demo seed
-- 1) Create users in Authentication (email/password)
-- 2) Replace the UUIDs below with those auth.users ids
-- 3) Run this script

-- Example cleaner profile already created by handle_new_user trigger.
-- Then:

-- update public.profiles
-- set role = 'cleaner', phone = '05551234567'
-- where id = 'CLEANER_USER_UUID';

-- insert into public.cleaners (
--   profile_id, bio, daily_rate, monthly_rate, services_offered, city, rating, review_count
-- ) values (
--   'CLEANER_USER_UUID',
--   '5 yıllık deneyimli ev ve ofis temizlik uzmanı.',
--   1500,
--   25000,
--   array['Genel temizlik', 'Ütü', 'Mutfak', 'Banyo'],
--   'İstanbul',
--   4.9,
--   0
-- );

-- insert into public.cleaner_availability (cleaner_id, day_of_week, start_time, end_time)
-- select c.id, d.day, '09:00'::time, '17:00'::time
-- from public.cleaners c
-- cross join (values (1),(2),(3),(4),(5)) as d(day)
-- where c.profile_id = 'CLEANER_USER_UUID';
