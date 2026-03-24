-- ============================================================
-- Health Passport — Supabase Schema
-- Paste this entire file into Supabase SQL Editor and run it.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── Drop existing tables (clean slate) ───────────────────────────────────
drop table if exists public.uploaded_reports cascade;
drop table if exists public.passports cascade;
drop table if exists public.user_profiles cascade;

-- ── Tables ───────────────────────────────────────────────────────────────

create table public.user_profiles (
  id            uuid primary key default uuid_generate_v4(),
  clerk_user_id text unique not null,
  role          text not null default 'patient' check (role in ('patient', 'doctor')),
  full_name     text not null default '',
  date_of_birth date,
  gender        text check (gender in ('male', 'female', 'other')),
  created_at    timestamptz default now()
);

create table public.passports (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid references public.user_profiles(id) on delete cascade not null,
  passport_code      text unique not null default '',
  blood_group        text,
  allergies          text[]  default '{}',
  conditions         text[]  default '{}',
  medicines          jsonb   default '[]',
  lab_values         jsonb   default '[]',
  emergency_contact  jsonb,
  ai_summary         text,
  completion_percent integer default 0,
  updated_at         timestamptz default now()
);

create table public.uploaded_reports (
  id           uuid primary key default uuid_generate_v4(),
  passport_id  uuid references public.passports(id) on delete cascade not null,
  file_url     text not null,
  file_name    text not null,
  uploaded_at  timestamptz default now()
);

-- ── Auto-generate passport_code on insert ────────────────────────────────

create or replace function generate_passport_code()
returns trigger language plpgsql as $$
begin
  new.passport_code := 'HP-' || upper(substring(md5(random()::text) from 1 for 6));
  return new;
end;
$$;

drop trigger if exists set_passport_code on public.passports;
create trigger set_passport_code
  before insert on public.passports
  for each row execute function generate_passport_code();

-- ── Row Level Security — DISABLED for development ────────────────────────
-- RLS is OFF so the anon key works without Clerk JWT configuration.
-- To enable RLS later: alter table public.user_profiles enable row level security;
-- and configure Clerk as a JWT provider in Supabase Dashboard → Settings → Auth.

alter table public.user_profiles    disable row level security;
alter table public.passports        disable row level security;
alter table public.uploaded_reports disable row level security;

-- ── Grant anon key full access (needed when RLS is off) ──────────────────
grant all on public.user_profiles    to anon, authenticated;
grant all on public.passports        to anon, authenticated;
grant all on public.uploaded_reports to anon, authenticated;
