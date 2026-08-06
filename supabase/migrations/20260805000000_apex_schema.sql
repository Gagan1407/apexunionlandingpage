-- Apex Union — single schema bootstrap
-- Tables: admin_users, leads (+ enrollment, sheets sync, rate-limit indexes)
-- Access: service role writes leads; authenticated admins (allowlist) read/update

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Admin allowlist
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Leads
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  country_code text,
  track text not null,
  current_status text not null,
  enrollment_status text not null default 'New',
  source text,
  client_submitted_at timestamptz,
  created_at timestamptz not null default now(),
  created_at_ist text,
  follow_up text,
  notes text,
  sheet_row_number integer,
  sheet_last_modified_at timestamptz,
  sheet_synced_at timestamptz,
  sheet_sync_error text,
  sheet_extra jsonb not null default '{}'::jsonb,
  user_agent text,
  ip_hash text,
  constraint leads_enrollment_status_check check (
    enrollment_status in (
      'New',
      'Contacted',
      'Pending Enrollment',
      'Enrolled',
      'Not Interested'
    )
  )
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists leads_created_at_idx
  on public.leads (created_at desc);

create index if not exists leads_email_idx
  on public.leads (email);

create index if not exists leads_email_created_at_idx
  on public.leads (email, created_at desc);

create index if not exists leads_ip_hash_created_at_idx
  on public.leads (ip_hash, created_at desc);

create index if not exists leads_enrollment_status_idx
  on public.leads (enrollment_status);

create index if not exists leads_sheet_row_number_idx
  on public.leads (sheet_row_number);

create index if not exists leads_sheet_sync_error_idx
  on public.leads (created_at desc)
  where sheet_sync_error is not null;

-- ---------------------------------------------------------------------------
-- Helpers + RLS
-- ---------------------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public.leads enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Drop MFA helper if a prior partial apply left it around
drop function if exists public.is_admin_mfa();

drop policy if exists "Admins can read leads" on public.leads;
create policy "Admins can read leads"
  on public.leads
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update leads" on public.leads;
create policy "Admins can update leads"
  on public.leads
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Clients may only change enrollment + sheet sync columns (see also incremental migration).
create or replace function public.leads_restrict_client_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.id is distinct from OLD.id
     or NEW.full_name is distinct from OLD.full_name
     or NEW.email is distinct from OLD.email
     or NEW.phone is distinct from OLD.phone
     or NEW.country_code is distinct from OLD.country_code
     or NEW.track is distinct from OLD.track
     or NEW.current_status is distinct from OLD.current_status
     or NEW.source is distinct from OLD.source
     or NEW.follow_up is distinct from OLD.follow_up
     or NEW.notes is distinct from OLD.notes
     or NEW.client_submitted_at is distinct from OLD.client_submitted_at
     or NEW.ip_hash is distinct from OLD.ip_hash
     or NEW.user_agent is distinct from OLD.user_agent
     or NEW.created_at is distinct from OLD.created_at
     or NEW.created_at_ist is distinct from OLD.created_at_ist
  then
    raise exception
      'Only enrollment_status and sheet sync columns may be updated'
      using errcode = '42501';
  end if;

  return NEW;
end;
$$;

drop trigger if exists leads_restrict_client_update on public.leads;
create trigger leads_restrict_client_update
  before update on public.leads
  for each row
  execute function public.leads_restrict_client_update();

drop policy if exists "Admins can read admin_users" on public.admin_users;
create policy "Admins can read admin_users"
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin());

-- No public insert on leads (Edge Function uses service role)

-- ---------------------------------------------------------------------------
-- Realtime for admin dashboard
-- ---------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.leads;
exception
  when duplicate_object then null;
end $$;
