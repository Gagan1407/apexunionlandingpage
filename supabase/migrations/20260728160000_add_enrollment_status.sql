-- Enrollment pipeline status (separate from applicant life status in current_status)
alter table public.leads
  add column if not exists enrollment_status text;

update public.leads
set enrollment_status = 'New'
where enrollment_status is null
   or btrim(enrollment_status) = '';

alter table public.leads
  alter column enrollment_status set default 'New';

alter table public.leads
  alter column enrollment_status set not null;

alter table public.leads
  drop constraint if exists leads_enrollment_status_check;

alter table public.leads
  add constraint leads_enrollment_status_check
  check (
    enrollment_status in (
      'New',
      'Contacted',
      'Pending Enrollment',
      'Enrolled',
      'Not Interested'
    )
  );

create index if not exists leads_enrollment_status_idx
  on public.leads (enrollment_status);
