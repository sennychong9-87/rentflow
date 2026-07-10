-- Add is_common_area column to units table for HMO / house share properties

alter table units
  add column is_common_area boolean not null default false;

-- Add an index on is_common_area for quick filtering
create index idx_units_is_common_area on units (is_common_area);
