begin;
alter table public.job_applications
  add column if not exists applied_on date;
notify pgrst, 'reload schema';
commit;
