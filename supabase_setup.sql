-- =========================================================
-- ลอยกระทงออนไลน์ (Loy Krathong Online)
-- Supabase PostgreSQL + Realtime Schema
-- =========================================================

-- 1. Create PROFILES Table
create table if not exists public.profiles (
  id text primary key,
  username text unique not null,
  nickname text not null,
  avatar_url text,
  gender text default 'female',
  target_gender text,
  birth_day text,
  zodiac text,
  facebook text,
  instagram text,
  tiktok text,
  allow_contact boolean default true,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create KRATHONGS Table
create table if not exists public.krathongs (
  id text primary key,
  mode text not null check (mode in ('single', 'couple', 'family')),
  name text not null,
  partner_name text,
  design jsonb not null default '{}'::jsonb,
  wish text default '',
  zodiac text,
  avatar_url text,
  likes integer default 1,
  lane integer default 2,
  speed integer default 25,
  delay numeric default 0,
  user_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Stored Procedure to atomically increment likes
create or replace function public.increment_likes(target_krathong_id text)
returns void as $$
begin
  update public.krathongs
  set likes = coalesce(likes, 0) + 1
  where id = target_krathong_id;
end;
$$ language plpgsql security definer;

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.krathongs enable row level security;

-- 5. RLS Policies for Profiles (Allow public access for festival participants)
drop policy if exists "Allow public select on profiles" on public.profiles;
create policy "Allow public select on profiles"
  on public.profiles for select
  using (true);

drop policy if exists "Allow public insert on profiles" on public.profiles;
create policy "Allow public insert on profiles"
  on public.profiles for insert
  with check (true);

drop policy if exists "Allow public update on profiles" on public.profiles;
create policy "Allow public update on profiles"
  on public.profiles for update
  using (true)
  with check (true);

-- 6. RLS Policies for Krathongs
drop policy if exists "Allow public select on krathongs" on public.krathongs;
create policy "Allow public select on krathongs"
  on public.krathongs for select
  using (true);

drop policy if exists "Allow public insert on krathongs" on public.krathongs;
create policy "Allow public insert on krathongs"
  on public.krathongs for insert
  with check (true);

drop policy if exists "Allow public update on krathongs" on public.krathongs;
create policy "Allow public update on krathongs"
  on public.krathongs for update
  using (true)
  with check (true);

-- 7. Enable Realtime Replication
alter table public.krathongs replica identity full;

-- Add krathongs to realtime publication (ignore if already added)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'krathongs'
  ) then
    alter publication supabase_realtime add table public.krathongs;
  end if;
end $$;

-- Optional: Create index for quick timestamp ordering
create index if not exists idx_krathongs_created_at on public.krathongs (created_at desc);
create index if not exists idx_profiles_username on public.profiles (username);
