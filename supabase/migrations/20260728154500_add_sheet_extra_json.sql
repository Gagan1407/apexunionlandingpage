alter table public.leads
  add column if not exists sheet_extra jsonb not null default '{}'::jsonb;
