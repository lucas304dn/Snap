-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Only run CREATE TABLE IF NOT EXISTS — safe to re-run

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  is_public boolean default true,
  created_at timestamptz default now()
);

create table if not exists friends (
  user_id uuid references profiles(id) on delete cascade,
  friend_id uuid references profiles(id) on delete cascade,
  status text default 'pending',  -- pending | accepted
  primary key (user_id, friend_id)
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  bunq_payment_id text unique,
  amount numeric,
  currency text default 'EUR',
  merchant text,
  merchant_category text,
  country_code text,
  snap_deadline timestamptz,
  snapped_at timestamptz,
  photo_url text,
  lat numeric,
  lng numeric,
  location_name text,
  caption text,
  is_public boolean default true,
  show_amount boolean default false,
  created_at timestamptz default now()
);

create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  emoji text,
  price_guess numeric,
  ai_reaction text,
  created_at timestamptz default now()
);

-- ============================================================
-- ENABLE REALTIME (required for camera countdown trigger)
-- Also enable in Supabase Dashboard → Table Editor → transactions → Enable Realtime
-- ============================================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- STORAGE BUCKET
-- Run in Dashboard → Storage → New bucket: name="snaps", public=true
-- Or via SQL:
-- ============================================================
insert into storage.buckets (id, name, public)
values ('snaps', 'snaps', true)
on conflict (id) do nothing;

-- Allow public read on snaps bucket
drop policy if exists "Public snap read" on storage.objects;
create policy "Public snap read"
  on storage.objects for select
  using (bucket_id = 'snaps');

-- Allow authenticated users to upload
drop policy if exists "Auth snap upload" on storage.objects;
create policy "Auth snap upload"
  on storage.objects for insert
  with check (bucket_id = 'snaps');

-- ============================================================
-- DEMO SEED DATA
-- Replace DEMO_USER_UUID with your actual Supabase user UUID
-- Get it from: Dashboard → Authentication → Users
-- ============================================================

-- Insert demo user profile (run after creating Supabase auth user)
-- insert into profiles (id, username, display_name)
-- values ('DEMO_USER_UUID', 'lucas', 'Lucas D.')
-- on conflict (id) do nothing;

-- Drop auth FK so fake demo profiles can be seeded without auth.users rows
alter table profiles drop constraint if exists profiles_id_fkey;

-- Insert fake friend profiles (no auth needed, just IDs)
insert into profiles (id, username, display_name)
values
  ('11111111-1111-1111-1111-111111111111', 'sara_k', 'Sara K.'),
  ('22222222-2222-2222-2222-222222222222', 'jake_m', 'Jake M.'),
  ('33333333-3333-3333-3333-333333333333', 'mia_v',  'Mia V.')
on conflict (id) do nothing;

-- Insert pre-snapped transactions for demo feed
-- (photo_url points to Unsplash for demo — replace with real Supabase Storage URLs)
insert into transactions
  (id, user_id, bunq_payment_id, amount, currency, merchant, location_name, country_code,
   snap_deadline, snapped_at, photo_url, caption, is_public, show_amount)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'seed-bunq-1', 5.60, 'EUR', 'Starbucks', 'Amsterdam', 'NL',
    now() - interval '1 hour',
    now() - interval '55 minutes',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
    'Oat latte fuelling another existential crisis ☕',
    true, false
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'seed-bunq-2', 89.95, 'EUR', 'Zara', 'Rotterdam', 'NL',
    now() - interval '2 hours',
    now() - interval '115 minutes',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    'Called it "investment clothing". Therapist disagrees 🛍️',
    true, true
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'seed-bunq-3', 9.40, 'EUR', 'McDonald''s', 'Utrecht', 'NL',
    now() - interval '24 hours',
    now() - interval '23 hours',
    'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&q=80',
    'No thoughts, head empty, just nuggets 🍟',
    true, false
  )
on conflict (bunq_payment_id) do nothing;

-- Insert friend reactions to show the leaderboard
insert into reactions (transaction_id, user_id, price_guess, ai_reaction)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 49.99, 'Bold guess — you undershopped by €40. Try harder next time!'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 99.00, 'Overcorrected like a first-time driver on the highway!')
on conflict do nothing;
