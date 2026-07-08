-- ============================================
-- 002: Properties + Units
-- A property has many units
-- ============================================

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,                    -- "Sunset Apartments", "123 Main St"
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  zip text,
  country text not null default 'US',
  property_type text not null default 'residential', -- residential | commercial | mixed
  total_units int not null default 1,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger properties_updated_at
  before update on public.properties
  for each row execute procedure public.handle_updated_at();

-- RLS
alter table public.properties enable row level security;

create policy "Landlord can manage own properties"
  on public.properties for all
  using (auth.uid() = landlord_id);

-- ============================================
-- Units: individual rentable spaces
-- ============================================

create table public.units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  unit_number text not null,             -- "1A", "101", "Ground Floor"
  bedrooms int not null default 1,
  bathrooms numeric(3,1) not null default 1,
  sq_ft int,
  floor_number int,
  monthly_rent numeric(10,2) not null default 0,
  deposit_amount numeric(10,2) not null default 0,
  status text not null default 'vacant', -- vacant | occupied | maintenance
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(property_id, unit_number)
);

create trigger units_updated_at
  before update on public.units
  for each row execute procedure public.handle_updated_at();

-- RLS
alter table public.units enable row level security;

create policy "Landlord can manage own units"
  on public.units for all
  using (auth.uid() = landlord_id);

-- Indexes for performance
create index idx_properties_landlord on public.properties(landlord_id);
create index idx_units_property on public.units(property_id);
create index idx_units_landlord on public.units(landlord_id);
create index idx_units_status on public.units(status);
