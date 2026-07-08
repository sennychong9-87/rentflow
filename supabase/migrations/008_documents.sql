-- ============================================
-- 008: Documents
-- Metadata for files stored in Supabase Storage
-- ============================================

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  unit_id uuid references public.units(id) on delete cascade,

  -- File info
  name text not null,                    -- Display name
  file_name text not null,              -- Actual filename in storage
  file_type text not null,              -- 'application/pdf', 'image/jpeg' etc
  file_size int,                         -- bytes
  storage_path text not null,           -- Supabase Storage path
  public_url text,                       -- Signed URL (regenerated on access)

  -- Category
  category text not null default 'other',
  -- lease | notice | inspection | photo | receipt | other

  -- Visibility
  visible_to_tenant boolean not null default false,

  created_at timestamptz not null default now()
);

-- RLS
alter table public.documents enable row level security;

create policy "Landlord can manage own documents"
  on public.documents for all
  using (auth.uid() = landlord_id);

create policy "Tenant can view shared documents"
  on public.documents for select
  using (visible_to_tenant = true);

-- Indexes
create index idx_documents_landlord on public.documents(landlord_id);
create index idx_documents_tenant on public.documents(tenant_id);
create index idx_documents_unit on public.documents(unit_id);
create index idx_documents_category on public.documents(category);

-- ============================================
-- Storage Buckets (run in Supabase dashboard)
-- ============================================
-- insert into storage.buckets (id, name, public)
-- values ('documents', 'documents', false);

-- insert into storage.buckets (id, name, public)
-- values ('avatars', 'avatars', true);

-- insert into storage.buckets (id, name, public)
-- values ('maintenance-photos', 'maintenance-photos', false);
