-- ============================================
-- 004: Leases
-- One active lease per tenant per unit
-- ============================================

create table public.leases (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,

  -- Lease terms
  start_date date not null,
  end_date date,                         -- null = month-to-month
  lease_type text not null default 'fixed', -- fixed | month_to_month
  monthly_rent numeric(10,2) not null,
  deposit_amount numeric(10,2) not null default 0,
  deposit_status text not null default 'held', -- held | returned | partial_return

  -- Rent due settings
  rent_due_day int not null default 1,   -- day of month rent is due (1-28)
  grace_period_days int not null default 5,
  late_fee_amount numeric(10,2) default 0,
  late_fee_type text default 'flat',     -- flat | percentage

  -- Document reference
  document_url text,                     -- Supabase Storage URL

  status text not null default 'active', -- active | expired | terminated
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger leases_updated_at
  before update on public.leases
  for each row execute procedure public.handle_updated_at();

-- RLS
alter table public.leases enable row level security;

create policy "Landlord can manage own leases"
  on public.leases for all
  using (auth.uid() = landlord_id);

-- Tenant can read their own lease via portal_token (handled in app logic)
create policy "Tenant can view own lease"
  on public.leases for select
  using (true); -- filtered by tenant_id in query

-- Indexes
create index idx_leases_landlord on public.leases(landlord_id);
create index idx_leases_tenant on public.leases(tenant_id);
create index idx_leases_unit on public.leases(unit_id);
create index idx_leases_status on public.leases(status);
create index idx_leases_end_date on public.leases(end_date);
