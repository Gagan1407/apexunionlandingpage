alter table public.leads
  add column if not exists follow_up text,
  add column if not exists notes text,
  add column if not exists sheet_row_number integer,
  add column if not exists sheet_last_modified_at timestamptz;

create index if not exists leads_sheet_row_number_idx on public.leads (sheet_row_number);
