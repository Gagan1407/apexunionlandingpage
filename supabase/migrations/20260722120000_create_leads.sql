-- Apex Union leads + admin allowlist
create extension if not exists "pgcrypto";

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  country_code text,
  track text not null,
  current_status text not null,
  source text,
  client_submitted_at timestamptz,
  created_at timestamptz not null default now(),
  created_at_ist text,
  sheet_synced_at timestamptz,
  sheet_sync_error text,
  user_agent text,
  ip_hash text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (email);

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

-- No public insert/select on leads (Edge Function uses service role)
create policy "Admins can read leads"
  on public.leads
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update leads"
  on public.leads
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can read admin_users"
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin());

-- Realtime for admin dashboard
do $$
begin
  alter publication supabase_realtime add table public.leads;
exception
  when duplicate_object then null;
end $$;
