-- PartnerPilot Database Schema
-- Run this in your Supabase SQL editor


-- Users table (extends Supabase auth.users)
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  timezone text default 'UTC',
  subscription_plan text default 'free' check (subscription_plan in ('free', 'pro', 'premium')),
  reminder_mode text default 'balanced' check (reminder_mode in ('light', 'balanced', 'super')),
  created_at timestamptz default now()
);

-- Partner profiles
create table if not exists public.partner_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  partner_name text not null,
  relationship_type text default 'girlfriend' check (relationship_type in ('wife', 'girlfriend', 'fiancée', 'partner')),
  birthday date,
  anniversary_date date,
  communication_style text,
  love_language text,
  likes text[] default '{}',
  dislikes text[] default '{}',
  sensitive_topics text[] default '{}',
  preferred_tone text default 'simple' check (preferred_tone in ('romantic', 'funny', 'simple', 'deep', 'playful', 'apologetic')),
  religious_cultural_background text,
  things_to_avoid text,
  favourite_food text,
  favourite_flowers text,
  favourite_restaurants text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Important dates
create table if not exists public.important_dates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  date date not null,
  repeats_yearly boolean default true,
  reminder_days_before integer[] default '{30, 14, 7, 1, 0}',
  category text default 'custom' check (category in ('birthday', 'anniversary', 'holiday', 'custom')),
  notes text,
  created_at timestamptz default now()
);

-- Message suggestions (history)
create table if not exists public.message_suggestions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  message_type text not null,
  tone text,
  generated_text_simple text,
  generated_text_romantic text,
  generated_text_playful text,
  copied_or_sent_status boolean default false,
  created_at timestamptz default now()
);

-- Gift ideas
create table if not exists public.gift_ideas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  occasion text,
  budget numeric(10, 2),
  link text,
  notes text,
  status text default 'idea' check (status in ('idea', 'ordered', 'delivered', 'completed')),
  reminder_date date,
  created_at timestamptz default now()
);

-- Date ideas
create table if not exists public.date_ideas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  budget text,
  location text,
  notes text,
  status text default 'idea' check (status in ('idea', 'planned', 'done')),
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table public.user_profiles enable row level security;
alter table public.partner_profiles enable row level security;
alter table public.important_dates enable row level security;
alter table public.message_suggestions enable row level security;
alter table public.gift_ideas enable row level security;
alter table public.date_ideas enable row level security;

-- user_profiles
create policy "Users can view own profile" on public.user_profiles
  for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.user_profiles
  for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.user_profiles
  for update using (auth.uid() = id);

-- partner_profiles
create policy "Users can manage own partner profile" on public.partner_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- important_dates
create policy "Users can manage own dates" on public.important_dates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- message_suggestions
create policy "Users can manage own messages" on public.message_suggestions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- gift_ideas
create policy "Users can manage own gifts" on public.gift_ideas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- date_ideas
create policy "Users can manage own date ideas" on public.date_ideas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Triggers
-- ============================================================

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on partner_profiles
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger partner_profiles_updated_at
  before update on public.partner_profiles
  for each row execute procedure public.set_updated_at();
