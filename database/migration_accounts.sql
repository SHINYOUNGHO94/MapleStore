-- Run this once against an existing MapleStore database.
-- It creates accounts, backfills ledger_entries.account_id from the old
-- location column, keeps Claude's balance columns, and refreshes the
-- Supabase API schema cache. Safe to re-run.

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_mine boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.accounts add column if not exists balance_meso numeric(20, 0) not null default 0;
alter table public.accounts add column if not exists balance_updated_at timestamptz;

insert into public.accounts (name, is_mine)
select '내 계정', true
where not exists (select 1 from public.accounts where is_mine = true);

insert into public.accounts (name, is_mine)
select '아야짱 통장', false
where not exists (select 1 from public.accounts where is_mine = false);

update public.accounts
set name = '내 계정'
where is_mine = true
  and name in ('내계정');

update public.accounts
set name = '아야짱 통장'
where is_mine = false
  and name in ('통장1', '여친 통장', '아야짱', '아야짱 계정');

update public.accounts
set is_mine = false
where name like '%아야%';

alter table public.ledger_entries
  add column if not exists account_id uuid references public.accounts(id);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ledger_entries'
      and column_name = 'location'
  ) then
    update public.ledger_entries
    set account_id = (
      select id
      from public.accounts
      where is_mine = true
      order by created_at asc
      limit 1
    )
    where account_id is null
      and location = 'my_account';
  end if;
end $$;

update public.ledger_entries
set account_id = (select id from public.accounts where is_mine = false order by created_at asc limit 1)
where account_id is null;

alter table public.ledger_entries
  alter column account_id set not null;

alter table public.ledger_entries
  drop column if exists location;

alter table public.ledger_entries
  drop column if exists character_name;

create index if not exists ledger_entries_account_id_idx
  on public.ledger_entries (account_id);

alter table public.accounts disable row level security;
alter table public.ledger_entries disable row level security;

grant usage on schema public to anon;
grant select, insert, update, delete on public.accounts to anon;
grant select, insert, update, delete on public.ledger_entries to anon;

notify pgrst, 'reload schema';
