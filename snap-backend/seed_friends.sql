-- Run this in Supabase SQL Editor after schema.sql
-- Seeds 5 fake friends + friend relationships + their pre-snapped transactions

-- ── 1. Drop auth FK so fake profiles can be inserted ────────────────────────
alter table profiles drop constraint if exists profiles_id_fkey;

-- ── 2. Friend profiles ───────────────────────────────────────────────────────
insert into profiles (id, username, display_name)
values
  ('aa000001-0000-0000-0000-000000000001', 'lena',  'Lena'),
  ('aa000002-0000-0000-0000-000000000002', 'tim',   'Tim'),
  ('aa000003-0000-0000-0000-000000000003', 'ali',   'Ali'),
  ('aa000004-0000-0000-0000-000000000004', 'maya',  'Maya'),
  ('aa000005-0000-0000-0000-000000000005', 'sofia', 'Sofia')
on conflict (id) do nothing;

-- ── 3. Friend relationships (replace YOUR_USER_ID with your Supabase UUID) ───
-- Your UUID: 8e206fc8-f211-43e7-b829-0134383d23e3
insert into friends (user_id, friend_id, status)
values
  ('8e206fc8-f211-43e7-b829-0134383d23e3', 'aa000001-0000-0000-0000-000000000001', 'accepted'),
  ('8e206fc8-f211-43e7-b829-0134383d23e3', 'aa000002-0000-0000-0000-000000000002', 'accepted'),
  ('8e206fc8-f211-43e7-b829-0134383d23e3', 'aa000003-0000-0000-0000-000000000003', 'accepted'),
  ('8e206fc8-f211-43e7-b829-0134383d23e3', 'aa000004-0000-0000-0000-000000000004', 'accepted'),
  ('8e206fc8-f211-43e7-b829-0134383d23e3', 'aa000005-0000-0000-0000-000000000005', 'accepted')
on conflict do nothing;

-- ── 4. Pre-snapped transactions for friends ──────────────────────────────────
insert into transactions
  (id, user_id, bunq_payment_id, amount, currency, merchant,
   location_name, country_code, snap_deadline, snapped_at,
   photo_url, caption, is_public, show_amount, lat, lng)
values
  -- Lena · La Pizza del Sol · Barcelona
  ('f1000001-0000-0000-0000-000000000001',
   'aa000001-0000-0000-0000-000000000001',
   'seed-lena-1', 14.50, 'EUR', 'La Pizza del Sol', 'Barcelona', 'ES',
   now() - interval '20 minutes', now() - interval '22 minutes',
   'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
   'Pizza for one, regrets for two 🍕', true, false, 41.3851, 2.1734),

  -- Tim · Westergasfabriek Market · Amsterdam
  ('f1000002-0000-0000-0000-000000000002',
   'aa000002-0000-0000-0000-000000000002',
   'seed-tim-1', 4.80, 'EUR', 'Westergasfabriek Market', 'Amsterdam', 'NL',
   now() - interval '118 minutes', now() - interval '120 minutes',
   'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
   'Farmers market therapy. Cheaper than a shrink 🌿', true, false, 52.3872, 4.8766),

  -- Ali · Brouwerij 't IJ · Amsterdam
  ('f1000003-0000-0000-0000-000000000003',
   'aa000003-0000-0000-0000-000000000003',
   'seed-ali-1', 9.50, 'EUR', 'Brouwerij ''t IJ', 'Amsterdam', 'NL',
   now() - interval '235 minutes', now() - interval '237 minutes',
   'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&q=80',
   'Beer brewed in a windmill. Amsterdam is built different 🍺', true, false, 52.3614, 4.9393),

  -- Maya · Poke Perfect · Amsterdam
  ('f1000004-0000-0000-0000-000000000004',
   'aa000004-0000-0000-0000-000000000004',
   'seed-maya-1', 13.90, 'EUR', 'Poke Perfect', 'Amsterdam', 'NL',
   now() - interval '295 minutes', now() - interval '297 minutes',
   'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
   'Healthy decisions occasionally 🥗', true, false, 52.3731, 4.8922),

  -- Sofia · Sugarbird Coffee · Amsterdam
  ('f1000005-0000-0000-0000-000000000005',
   'aa000005-0000-0000-0000-000000000005',
   'seed-sofia-1', 4.20, 'EUR', 'Sugarbird Coffee', 'Amsterdam', 'NL',
   now() - interval '415 minutes', now() - interval '417 minutes',
   'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
   'Oat milk flat white. Unironically worth it every time ☕', true, false, 52.3738, 4.8910),

  -- Lena · Zara · Barcelona
  ('f1000006-0000-0000-0000-000000000006',
   'aa000001-0000-0000-0000-000000000001',
   'seed-lena-2', 49.95, 'EUR', 'Zara', 'Barcelona', 'ES',
   now() - interval '535 minutes', now() - interval '537 minutes',
   'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80',
   'Called it "investment clothing". Closet disagrees 🛍️', true, false, 41.3799, 2.1699),

  -- Ali · Tokyo Ramen Bar · Berlin
  ('f1000007-0000-0000-0000-000000000007',
   'aa000003-0000-0000-0000-000000000003',
   'seed-ali-2', 18.20, 'EUR', 'Tokyo Ramen Bar', 'Berlin', 'DE',
   now() - interval '655 minutes', now() - interval '657 minutes',
   'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
   'Late-night ramen hits different 🍜', true, false, 52.5200, 13.4050),

  -- Tim · Paradiso · Amsterdam
  ('f1000008-0000-0000-0000-000000000008',
   'aa000002-0000-0000-0000-000000000002',
   'seed-tim-2', 22.00, 'EUR', 'Paradiso', 'Amsterdam', 'NL',
   now() - interval '775 minutes', now() - interval '777 minutes',
   'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
   'Worth every cent. My ears disagree 🎶', true, false, 52.3626, 4.8813),

  -- Sofia · HEMA · Amsterdam
  ('f1000009-0000-0000-0000-000000000009',
   'aa000005-0000-0000-0000-000000000005',
   'seed-sofia-2', 6.90, 'EUR', 'HEMA', 'Amsterdam', 'NL',
   now() - interval '955 minutes', now() - interval '957 minutes',
   'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
   'Stroopwafel + socks combo. Peak Dutch 🇳🇱', true, false, 52.3731, 4.8922),

  -- Maya · Rijksmuseum · Amsterdam
  ('f1000010-0000-0000-0000-000000000010',
   'aa000004-0000-0000-0000-000000000004',
   'seed-maya-2', 22.50, 'EUR', 'Rijksmuseum', 'Amsterdam', 'NL',
   now() - interval '1195 minutes', now() - interval '1197 minutes',
   'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80',
   'Culture loading… please wait ☁️', true, false, 52.3600, 4.8852),

  -- Maya · Cafe de Jaren · Amsterdam
  ('f1000011-0000-0000-0000-000000000011',
   'aa000004-0000-0000-0000-000000000004',
   'seed-maya-3', 7.50, 'EUR', 'Cafe de Jaren', 'Amsterdam', 'NL',
   now() - interval '1675 minutes', now() - interval '1677 minutes',
   'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80',
   'Canal view, overpriced OJ, zero regrets 🌊', true, false, 52.3689, 4.8975),

  -- Lena · Le Petit Café · Paris
  ('f1000012-0000-0000-0000-000000000012',
   'aa000001-0000-0000-0000-000000000001',
   'seed-lena-3', 3.20, 'EUR', 'Le Petit Café', 'Paris', 'FR',
   now() - interval '2155 minutes', now() - interval '2157 minutes',
   'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80',
   'Croissant + espresso = main character energy ☕', true, false, 48.8566, 2.3522),

  -- Ali · KaDeWe · Berlin
  ('f1000013-0000-0000-0000-000000000013',
   'aa000003-0000-0000-0000-000000000003',
   'seed-ali-3', 67.00, 'EUR', 'KaDeWe', 'Berlin', 'DE',
   now() - interval '2875 minutes', now() - interval '2877 minutes',
   'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
   'Department store dangers. Send help 🏬', true, false, 52.5027, 13.3357)

on conflict (bunq_payment_id) do nothing;
