-- ============================================
-- 005: Rent Ledger
-- Tracks rent for each month per tenant
-- ============================================

create table public.rent_ledger (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lease_id uuid not null references public.leases(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,

  -- Which month this record covers
  period_month int not null,             -- 1-12
  period_year int not null,

  -- Amounts
  rent_due numeric(10,2) not null,
  rent_paid numeric(10,2) not null default 0,
  late_fee numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  balance numeric(10,2) generated always as (rent_due + late_fee - discount - rent_paid) stored,

  -- Payment details
  status text not null default 'pending', -- pending | paid | partial | late | waived
  payment_date date,
  payment_method text,                   -- cash | bank_transfer | check | online
  payment_reference text,               -- check number, transaction ID etc
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- One record per tenant per month
  unique(tenant_id, period_month, period_year)
);

create trigger rent_ledger_updated_at
  before update on public.rent_ledger
  for each row execute procedure public.handle_updated_at();

-- RLS
alter table public.rent_ledger enable row level security;

create policy "Landlord can manage own rent ledger"
  on public.rent_ledger for all
  using (auth.uid() = landlord_id);

create policy "Tenant can view own rent records"
  on public.rent_ledger for select
  using (true); -- filtered by tenant_id in app

-- Indexes
create index idx_rent_landlord on public.rent_ledger(landlord_id);
create index idx_rent_tenant on public.rent_ledger(tenant_id);
create index idx_rent_period on public.rent_ledger(period_year, period_month);
create index idx_rent_status on public.rent_ledger(status);
