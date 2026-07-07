alter table public.cash_entries
  add column if not exists owner text not null default 'aya';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cash_entries_owner_check'
      and conrelid = 'public.cash_entries'::regclass
  ) then
    alter table public.cash_entries
      add constraint cash_entries_owner_check check (owner in ('aya', 'oppa'));
  end if;
end $$;

create index if not exists cash_entries_owner_idx
  on public.cash_entries (owner);

notify pgrst, 'reload schema';
