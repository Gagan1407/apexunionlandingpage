-- Speed up submit-lead rate-limit COUNT queries
create index if not exists leads_ip_hash_created_at_idx
  on public.leads (ip_hash, created_at desc);

create index if not exists leads_email_created_at_idx
  on public.leads (email, created_at desc);

create index if not exists leads_sheet_sync_error_idx
  on public.leads (created_at desc)
  where sheet_sync_error is not null;
