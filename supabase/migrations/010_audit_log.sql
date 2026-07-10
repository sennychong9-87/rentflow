-- Create audit_log table for tracking all significant state changes

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid references profiles(id) on delete cascade not null,
  entity_type text not null,
  entity_id uuid,
  entity_label text,
  action text not null,
  description text not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- Indexes for common query patterns
create index idx_audit_log_landlord_id on audit_log (landlord_id);
create index idx_audit_log_entity_type on audit_log (entity_type);
create index idx_audit_log_entity_id on audit_log (entity_id);
create index idx_audit_log_created_at_desc on audit_log (created_at desc);

-- Enable RLS
alter table audit_log enable row level security;

-- Landlords can only read their own audit logs
create policy "Landlords can read own audit logs"
  on audit_log for select
  using (auth.uid() = landlord_id);

-- No updates or deletes allowed (append-only)
create policy "No updates on audit_log"
  on audit_log for update
  with check (false);

create policy "No deletes on audit_log"
  on audit_log for delete
  using (false);

-- Allow authenticated users to insert audit logs
-- (they'll reference their own landlord_id)
create policy "Authenticated users can insert audit logs"
  on audit_log for insert
  with check (auth.uid() = landlord_id);
