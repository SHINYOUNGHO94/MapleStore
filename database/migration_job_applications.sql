begin;
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  company_name text not null check (length(btrim(company_name)) between 1 and 200),
  company_key text generated always as (lower(btrim(regexp_replace(company_name, '\s+', ' ', 'g')))) stored unique,
  sites text[] not null check (cardinality(sites) > 0 and sites <@ array['Green','OpenWork','Findy-code','paiza']::text[] and array_position(sites, null) is null),
  added_on date not null,
  created_at timestamptz not null default now(),
  version integer not null default 1
);
create or replace function public.bump_job_application_version() returns trigger
language plpgsql set search_path = public as $$
begin
  new.version := old.version + 1;
  new.added_on := old.added_on;
  new.created_at := old.created_at;
  return new;
end;
$$;
drop trigger if exists job_application_version on public.job_applications;
create trigger job_application_version before update on public.job_applications
for each row execute function public.bump_job_application_version();
create or replace function public.merge_job_application_sites(target_id uuid, new_sites text[])
returns setof public.job_applications language sql security invoker set search_path = public as $$
  update public.job_applications
  set sites = array(select distinct site from unnest(sites || new_sites) as site order by site)
  where id = target_id returning *;
$$;
-- Same shared anon access model as the existing MapleStore tables.
-- The app's Vercel login does not protect direct Supabase API access.
alter table public.job_applications disable row level security;
grant select, insert, update, delete on public.job_applications to anon;
revoke all on function public.merge_job_application_sites(uuid, text[]) from public;
grant execute on function public.merge_job_application_sites(uuid, text[]) to anon;
notify pgrst, 'reload schema';
commit;
