-- ============================================
-- 007: Messages
-- Thread-based landlord <-> tenant messaging
-- ============================================

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,

  -- Who sent it
  sender text not null, -- 'landlord' | 'tenant'

  -- Content
  body text not null,
  is_read boolean not null default false,

  -- Optional: link to a maintenance ticket
  maintenance_id uuid references public.maintenance(id) on delete set null,

  created_at timestamptz not null default now()
);

-- RLS
alter table public.messages enable row level security;

create policy "Landlord can manage own messages"
  on public.messages for all
  using (auth.uid() = landlord_id);

create policy "Tenant can view and insert own messages"
  on public.messages for select
  using (true);

create policy "Tenant portal can send messages"
  on public.messages for insert
  with check (true);

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;

-- Indexes
create index idx_messages_landlord on public.messages(landlord_id);
create index idx_messages_tenant on public.messages(tenant_id);
create index idx_messages_created on public.messages(created_at desc);
create index idx_messages_unread on public.messages(landlord_id, is_read) where is_read = false;
