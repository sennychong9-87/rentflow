-- ============================================
-- 003: Tenants
-- Tenants do NOT need a Supabase auth account
-- They access the portal via a unique token link
-- ============================================

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,

  -- Personal info
  full_name text not null,
  email text not null,
  phone text,
  emergency_contact_name text,
  emergency_contact_phone text,

  -- Portal access (no password needed — magic token link)
  portal_token text unique not null default encode(gen_random_bytes(24), 'hex'),
  portal_last_accessed timestamptz,

  -- Status
  status text not null default 'active', -- active | vacating | vacated
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tenants_updated_at
  before update on public.tenants
  for each row execute procedure public.handle_updated_at();

-- RLS: landlord manages their tenants
alter table public.tenants enable row level security;

create policy "Landlord can manage own tenants"
  on public.tenants for all
  using (auth.uid() = landlord_id);

-- Allow public read via portal_token (for tenant portal page)
create policy "Tenant portal access via token"
  on public.tenants for select
  using (true); -- filtered by portal_token in query, not RLS

-- Indexes
create index idx_tenants_landlord on public.tenants(landlord_id);
create index idx_tenants_unit on public.tenants(unit_id);
create index idx_tenants_portal_token on public.tenants(portal_token);
create index idx_tenants_status on public.tenants(status);
