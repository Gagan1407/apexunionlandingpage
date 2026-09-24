-- Singleton dummy row used only to generate free-tier database activity.
-- No lead/admin data. Anon may select/update this row; insert/delete stay blocked.

create table if not exists public.keepalive (
  id smallint primary key check (id = 1),
  last_ping_at timestamptz not null default now(),
  note text not null default 'ok'
);

insert into public.keepalive (id, last_ping_at, note)
values (1, now(), 'ok')
on conflict (id) do nothing;

alter table public.keepalive enable row level security;

drop policy if exists "Public can read keepalive" on public.keepalive;
create policy "Public can read keepalive"
  on public.keepalive
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can update keepalive" on public.keepalive;
create policy "Public can update keepalive"
  on public.keepalive
  for update
  to anon, authenticated
  using (id = 1)
  with check (id = 1);

grant select, update on table public.keepalive to anon, authenticated;
revoke insert, delete on table public.keepalive from anon, authenticated;
