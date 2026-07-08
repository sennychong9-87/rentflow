-- ============================================
-- 006: Maintenance Tickets
-- Submitted by tenants via portal, managed by landlord
-- ============================================

create table public.maintenance (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,

  -- Ticket details
  title text not null,
  description text not null,
  category text not null default 'general',
  -- plumbing | electrical | hvac | appliance | structural | pest | general | other
  priority text not null default 'medium', -- low | medium | high | emergency
  status text not null default 'open',     -- open | in_progress | resolved | closed

  -- Who submitted
  submitted_by text not null default 'tenant', -- tenant | landlord

  -- Scheduling
  preferred_entry_time text,             -- "Morning", "Afternoon", "Anytime"
  scheduled_date date,
  resolved_date date,

  -- Resolution
  resolution_notes text,
  repair_cost numeric(10,2),

  -- Photos (array of Supabase Storage URLs)
  photo_urls text[] default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger maintenance_updated_at
  before update on public.maintenance
  for each row execute procedure public.handle_updated_at();

-- RLS
alter table public.maintenance enable row level security;

create policy "Landlord can manage own maintenance tickets"
  on public.maintenance for all
  using (auth.uid() = landlord_id);

-- Tenant can insert and view their own tickets (via app logic with portal_token)
create policy "Tenant can submit and view own tickets"
  on public.maintenance for select
  using (true);

-- Allow inserts from tenant portal (unauthenticated — validated in edge function)
create policy "Tenant portal can insert tickets"
  on public.maintenance for insert
  with check (true);

-- Indexes
create index idx_maintenance_landlord on public.maintenance(landlord_id);
create index idx_maintenance_tenant on public.maintenance(tenant_id);
create index idx_maintenance_unit on public.maintenance(unit_id);
create index idx_maintenance_status on public.maintenance(status);
create index idx_maintenance_priority on public.maintenance(priority);
create index idx_maintenance_created on public.maintenance(created_at desc);
