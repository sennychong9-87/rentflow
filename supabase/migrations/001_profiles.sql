-- ============================================
-- 001: Landlord Profiles
-- Extends Supabase auth.users
-- ============================================

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  business_name text,
  plan text not null default 'free', -- free | pro | growth
  plan_status text not null default 'active', -- active | cancelled | past_due
  tenant_portal_slug text unique, -- used for white-label portal URL
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Landlord'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- RLS: landlords can only see/edit their own profile
alter table public.profiles enable row level security;

create policy "Landlord can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Landlord can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
