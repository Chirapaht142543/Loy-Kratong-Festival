-- =========================================================
-- ลอยกระทงออนไลน์ (Loy Krathong Online)
-- PostgreSQL Schema
-- =========================================================

-- 1. Create PROFILES Table
create table if not exists profiles (
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
create table if not exists krathongs (
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

-- 3. Indexes for fast queries
create index if not exists idx_krathongs_created_at on krathongs (created_at desc);
create index if not exists idx_profiles_username on profiles (username);
