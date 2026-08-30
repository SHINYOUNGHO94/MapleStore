alter table public.cash_entries
  add column if not exists maple_server text;

alter table public.cash_entries
  add column if not exists sold_meso numeric(20, 0);

alter table public.cash_entries
  add column if not exists linked_ledger_entry_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cash_entries_maple_server_check'
      and conrelid = 'public.cash_entries'::regclass
  ) then
    alter table public.cash_entries
      add constraint cash_entries_maple_server_check
      check (maple_server is null or maple_server in ('scania', 'challengers'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'cash_entries_sold_meso_check'
      and conrelid = 'public.cash_entries'::regclass
  ) then
    alter table public.cash_entries
      add constraint cash_entries_sold_meso_check
      check (sold_meso is null or sold_meso >= 0);
  end if;
end $$;

create index if not exists cash_entries_maple_server_idx
  on public.cash_entries (maple_server);

create index if not exists cash_entries_linked_ledger_entry_id_idx
  on public.cash_entries (linked_ledger_entry_id);

notify pgrst, 'reload schema';
