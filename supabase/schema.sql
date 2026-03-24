-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User profiles (linked to Clerk user IDs)
create table public.user_profiles (
  id uuid primary key default uuid_generate_v4(),
  clerk_user_id text unique not null,
  role text not null check (role in ('patient', 'doctor')),
  full_name text not null,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other')),
  created_at timestamptz default now()
);

-- Passports
create table public.passports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  passport_code text unique not null,
  blood_group text,
  allergies text[] default '{}',
  conditions text[] default '{}',
  medicines jsonb default '[]',
  lab_values jsonb default '[]',
  emergency_contact jsonb,
  ai_summary text,
  completion_percent integer default 0,
  updated_at timestamptz default now()
);

-- Uploaded reports
create table public.uploaded_reports (
  id uuid primary key default uuid_generate_v4(),
  passport_id uuid references public.passports(id) on delete cascade not null,
  file_url text not null,
  file_name text not null,
  uploaded_at timestamptz default now()
);

-- Row Level Security
alter table public.user_profiles enable row level security;
alter table public.passports enable row level security;
alter table public.uploaded_reports enable row level security;

-- Policies: users can only read/write their own data
create policy "Users can read own profile"
  on public.user_profiles for select
  using (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users can update own profile"
  on public.user_profiles for update
  using (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Passport: owner can do everything, anyone can read by passport_code (for QR access)
create policy "Owner can manage passport"
  on public.passports for all
  using (user_id in (
    select id from public.user_profiles
    where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

create policy "Anyone can read passport by code"
  on public.passports for select
  using (true);

-- Reports: owner only
create policy "Owner can manage reports"
  on public.uploaded_reports for all
  using (passport_id in (
    select p.id from public.passports p
    join public.user_profiles u on p.user_id = u.id
    where u.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Auto-generate passport_code on insert
create or replace function generate_passport_code()
returns trigger as $$
begin
  new.passport_code := 'HP-' || upper(substring(md5(random()::text) from 1 for 4));
  return new;
end;
$$ language plpgsql;

create trigger set_passport_code
  before insert on public.passports
  for each row execute function generate_passport_code();
