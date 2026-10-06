-- mismis demo data for a Supabase project (run after migration.sql, in the SQL editor).
-- Creates demo accounts (password: mismis123):
--   musteri@mismis.app (Fatma Demir), ayse@mismis.app, mehmet@mismis.app, elif@mismis.app,
--   zeynep@mismis.app, hatice@mismis.app (cleaners).
-- Mirrors mobile/src/data/seed.ts, which the app uses in offline demo mode.

create extension if not exists pgcrypto;

do $$
declare
  u record;
begin
  for u in
    select * from (values
      ('00000000-0000-4000-a000-000000000001'::uuid, 'musteri@mismis.app', 'Fatma Demir', 'customer'),
      ('00000000-0000-4000-a000-000000000011'::uuid, 'ayse@mismis.app', 'Ayşe Yılmaz', 'cleaner'),
      ('00000000-0000-4000-a000-000000000012'::uuid, 'mehmet@mismis.app', 'Mehmet Kaya', 'cleaner'),
      ('00000000-0000-4000-a000-000000000013'::uuid, 'elif@mismis.app', 'Elif Şahin', 'cleaner'),
      ('00000000-0000-4000-a000-000000000014'::uuid, 'zeynep@mismis.app', 'Zeynep Arslan', 'cleaner'),
      ('00000000-0000-4000-a000-000000000015'::uuid, 'hatice@mismis.app', 'Hatice Çelik', 'cleaner')
    ) as t(id, email, full_name, role)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
      crypt('mismis123', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', u.full_name, 'role', u.role),
      now(), now(), '', '', '', ''
    ) on conflict (id) do nothing;

    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), u.id, u.id::text, jsonb_build_object('sub', u.id::text, 'email', u.email), 'email', now(), now(), now())
    on conflict do nothing;
  end loop;
end $$;

update public.profiles p set avatar_url = v.url
from (values
  ('00000000-0000-4000-a000-000000000011'::uuid, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop&crop=faces'),
  ('00000000-0000-4000-a000-000000000012'::uuid, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=faces'),
  ('00000000-0000-4000-a000-000000000013'::uuid, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop&crop=faces'),
  ('00000000-0000-4000-a000-000000000014'::uuid, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop&crop=faces'),
  ('00000000-0000-4000-a000-000000000015'::uuid, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop&crop=faces')
) as v(id, url)
where p.id = v.id;

insert into public.cleaners (
  profile_id, bio, rating, review_count, daily_rate, monthly_rate, services_offered, service_areas,
  special_requests, city, prices, cleaning_types, rules, years_experience, completed_jobs, insurance_status
) values
  ('00000000-0000-4000-a000-000000000011', '8 yıldır ev temizliği yapıyorum. Mutfak ve banyoda çok titizimdir. Büyüklerimize saygıyla ve sabırla hizmet ederim.',
   4.9, 47, 2700, 0, '{}', '{Bornova,Bayraklı,Alsancak}', '', 'İzmir',
   '{"1+1":2200,"2+1":2700,"3+1":3400,"4+1":4500}', '{genel,derin}',
   '{"noDogs":true,"noCats":false,"noPets":false,"other":"Temizlik malzemesi evde olmalı."}', 8, 112, 'dogrulandi'),
  ('00000000-0000-4000-a000-000000000012', 'Cam, balkon ve detaylı temizlikte 5 yıllık deneyimim var. Kendi ekipmanımı getiririm.',
   4.7, 31, 2500, 0, '{}', '{Karşıyaka,Çiğli,Bostanlı}', '', 'İzmir',
   '{"1+1":2000,"2+1":2500,"3+1":3200,"4+1":4200}', '{genel,derin,insaat}',
   '{"noDogs":false,"noCats":false,"noPets":false,"other":"4. kattan yukarısı için asansör olmalı."}', 5, 76, 'dogrulandi'),
  ('00000000-0000-4000-a000-000000000013', 'Doğal ve kokusuz ürünlerle çalışırım. Hasta veya bebek olan evlerde özenle temizlik yaparım.',
   4.8, 22, 3000, 0, '{}', '{Konak,Göztepe,Güzelyalı}', '', 'İzmir',
   '{"1+1":2400,"2+1":3000,"3+1":3700,"4+1":4800}', '{genel,derin}',
   '{"noDogs":false,"noCats":false,"noPets":true,"other":"Kimyasal koku istemeyen evler için uygundur."}', 6, 54, 'dogrulandi'),
  ('00000000-0000-4000-a000-000000000014', 'Taşınma ve detaylı temizlik uzmanıyım. Evinizi baştan sona pırıl pırıl yaparım.',
   4.6, 18, 3100, 0, '{}', '{Buca,Gaziemir,Şirinyer}', '', 'İzmir',
   '{"1+1":2500,"2+1":3100,"3+1":3900,"4+1":5200}', '{genel,derin,tasinma}',
   '{"noDogs":false,"noCats":false,"noPets":false,"other":"Detaylı temizlik için en az 5 saat ayırın."}', 10, 40, 'dogrulandi'),
  ('00000000-0000-4000-a000-000000000015', 'Haftalık düzenli temizlik yapıyorum. Aynı evlere yıllardır gidiyorum.',
   5.0, 12, 2300, 0, '{}', '{Karabağlar,Balçova,Narlıdere}', '', 'İzmir',
   '{"1+1":1900,"2+1":2300,"3+1":2900,"4+1":3900}', '{genel}',
   '{"noDogs":true,"noCats":true,"noPets":false,"other":""}', 12, 63, 'inceleniyor')
on conflict (profile_id) do nothing;

-- Two weeks of slots, same pattern as the offline demo.
insert into public.availability_slots (cleaner_id, slot_date, template)
select c.id, current_date + d, t.template
from (select id, row_number() over (order by profile_id) - 1 as ci from public.cleaners
      where profile_id::text like '00000000-0000-4000-a000-00000000001%') c
cross join generate_series(1, 14) d
cross join (values ('sabah', 0), ('ogleden-sonra', 1)) t(template, ti)
where (d + c.ci + t.ti) % 3 <> 0
on conflict do nothing;
