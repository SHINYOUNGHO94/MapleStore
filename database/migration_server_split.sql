alter table public.ledger_entries
  add column if not exists server text not null default 'scania';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ledger_entries_server_check'
      and conrelid = 'public.ledger_entries'::regclass
  ) then
    alter table public.ledger_entries
      add constraint ledger_entries_server_check check (server in ('scania', 'challengers'));
  end if;
end $$;

create index if not exists ledger_entries_server_idx
  on public.ledger_entries (server);

create table if not exists public.server_transfers (
  id uuid primary key default gen_random_uuid(),
  occurred_on date not null,
  from_server text not null check (from_server in ('scania', 'challengers')),
  to_server text not null check (to_server in ('scania', 'challengers')),
  amount_meso numeric(20, 0) not null check (amount_meso >= 0),
  fee_meso numeric(20, 0) not null check (fee_meso >= 0),
  received_meso numeric(20, 0) not null check (received_meso >= 0),
  oppa_amount_meso numeric(20, 0) not null check (oppa_amount_meso >= 0 and oppa_amount_meso <= amount_meso),
  oppa_fee_meso numeric(20, 0) not null check (oppa_fee_meso >= 0),
  oppa_received_meso numeric(20, 0) not null check (oppa_received_meso >= 0),
  memo text,
  created_at timestamptz not null default now(),
  check (from_server <> to_server)
);

create index if not exists server_transfers_occurred_on_idx
  on public.server_transfers (occurred_on desc);

create index if not exists server_transfers_from_server_idx
  on public.server_transfers (from_server);

create index if not exists server_transfers_to_server_idx
  on public.server_transfers (to_server);

alter table public.server_transfers
  add column if not exists oppa_amount_meso numeric(20, 0);

alter table public.server_transfers
  add column if not exists oppa_fee_meso numeric(20, 0);

alter table public.server_transfers
  add column if not exists oppa_received_meso numeric(20, 0);

update public.server_transfers
set
  oppa_amount_meso = coalesce(oppa_amount_meso, amount_meso),
  oppa_fee_meso = coalesce(oppa_fee_meso, fee_meso),
  oppa_received_meso = coalesce(oppa_received_meso, received_meso);

alter table public.server_transfers
  alter column oppa_amount_meso set not null,
  alter column oppa_fee_meso set not null,
  alter column oppa_received_meso set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'server_transfers_oppa_amount_check'
      and conrelid = 'public.server_transfers'::regclass
  ) then
    alter table public.server_transfers
      add constraint server_transfers_oppa_amount_check check (oppa_amount_meso >= 0 and oppa_amount_meso <= amount_meso);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'server_transfers_oppa_fee_check'
      and conrelid = 'public.server_transfers'::regclass
  ) then
    alter table public.server_transfers
      add constraint server_transfers_oppa_fee_check check (oppa_fee_meso >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'server_transfers_oppa_received_check'
      and conrelid = 'public.server_transfers'::regclass
  ) then
    alter table public.server_transfers
      add constraint server_transfers_oppa_received_check check (oppa_received_meso >= 0);
  end if;
end $$;

alter table public.server_transfers disable row level security;
grant select, insert, update, delete on public.server_transfers to anon;

notify pgrst, 'reload schema';
