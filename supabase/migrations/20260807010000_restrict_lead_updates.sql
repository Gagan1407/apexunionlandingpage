-- Restrict authenticated/client updates on leads to enrollment + sheet sync columns.
-- Service role still fires this trigger; sheet sync field updates remain allowed.

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
