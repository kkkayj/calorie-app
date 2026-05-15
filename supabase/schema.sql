-- ============================================================
-- CalorieApp Database Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================


-- ============================================================
-- TABLE 1: profiles
-- Stores personal info for each user (filled in during onboarding)
-- ============================================================
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  age         integer,
  gender      text check (gender in ('male', 'female')),
  weight_kg   numeric(5, 1),
  height_cm   numeric(5, 1),
  activity_level text check (activity_level in (
    'sedentary', 'light', 'moderate', 'active', 'very_active'
  )),
  goal        text check (goal in ('lose', 'maintain', 'gain')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- TABLE 2: subscriptions
-- Tracks whether each user is on Free or Pro
-- Stripe updates this automatically via webhook (Phase 6)
-- ============================================================
create table public.subscriptions (
  id                       uuid default gen_random_uuid() primary key,
  user_id                  uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id       text,
  stripe_subscription_id   text,
  status                   text check (status in (
    'active', 'canceled', 'past_due', 'trialing', 'incomplete'
  )),
  price_id                 text,
  current_period_end       timestamptz,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

-- ============================================================
-- TABLE 3: calorie_logs
-- One row per food item logged by a user on a given day
-- ============================================================
create table public.calorie_logs (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  logged_date date not null default current_date,
  meal_type   text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')) not null,
  food_name   text not null,
  calories    integer not null,
  protein_g   numeric(6, 1) default 0,
  carbs_g     numeric(6, 1) default 0,
  fat_g       numeric(6, 1) default 0,
  created_at  timestamptz default now()
);

-- ============================================================
-- TABLE 4: calorie_plans
-- Stores AI-generated 7-day meal plans as JSON (Pro feature)
-- ============================================================
create table public.calorie_plans (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  plan_data   jsonb not null,
  tdee        integer not null,
  goal        text check (goal in ('lose', 'maintain', 'gain')) not null,
  created_at  timestamptz default now()
);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- This ensures users can only see and edit THEIR OWN data.
-- Without this, any logged-in user could read everyone's data.
-- ============================================================

alter table public.profiles      enable row level security;
alter table public.subscriptions enable row level security;
alter table public.calorie_logs  enable row level security;
alter table public.calorie_plans enable row level security;

-- profiles: users can read and update only their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- subscriptions: users can only read their own subscription
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- calorie_logs: users can fully manage their own logs
create policy "Users can view own logs"
  on public.calorie_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on public.calorie_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own logs"
  on public.calorie_logs for delete
  using (auth.uid() = user_id);

-- calorie_plans: users can view and create their own plans
create policy "Users can view own plans"
  on public.calorie_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert own plans"
  on public.calorie_plans for insert
  with check (auth.uid() = user_id);


-- ============================================================
-- TRIGGER: auto-create a profile row when a new user signs up
-- This runs automatically — you don't call it manually
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
