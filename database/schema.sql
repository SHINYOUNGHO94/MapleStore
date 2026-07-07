create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_mine boolean not null default false,
  balance_meso numeric(20, 0) not null default 0,
  balance_updated_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  occurred_on date not null,
  entry_type text not null check (
    entry_type in (
      'boss_income',
      'girlfriend_income',
      'boss_cost_my',
      'boss_cost_girlfriend',
      'girlfriend_contribution',
      'repay_girlfriend',
      'withdraw_my_share',
      'adjustment'
    )
  ),
  account_id uuid not null references public.accounts(id),
  amount_meso numeric(20, 0) not null check (amount_meso >= 0),
  boss_name text,
  memo text,
  created_at timestamptz not null default now()
);

create index if not exists ledger_entries_occurred_on_idx
  on public.ledger_entries (occurred_on desc);

create index if not exists ledger_entries_entry_type_idx
  on public.ledger_entries (entry_type);

create index if not exists ledger_entries_account_id_idx
  on public.ledger_entries (account_id);

create table if not exists public.cash_entries (
  id uuid primary key default gen_random_uuid(),
  occurred_on date not null,
  owner text not null default 'aya' check (owner in ('aya', 'oppa')),
  game text not null check (game in ('maple', 'lostark')),
  direction text not null check (direction in ('deposit', 'withdraw')),
  currency text not null check (currency in ('KRW', 'JPY')),
  amount_cash numeric(20, 0) not null check (amount_cash >= 0),
  memo text,
  created_at timestamptz not null default now()
);

create index if not exists cash_entries_occurred_on_idx
  on public.cash_entries (occurred_on desc);

create index if not exists cash_entries_game_idx
  on public.cash_entries (game);

create index if not exists cash_entries_owner_idx
  on public.cash_entries (owner);

create index if not exists cash_entries_currency_idx
  on public.cash_entries (currency);

create table if not exists public.lostark_entries (
  id uuid primary key default gen_random_uuid(),
  occurred_on date not null,
  direction text not null check (direction in ('deposit', 'withdraw')),
  gross_gold numeric(20, 0) not null check (gross_gold >= 0),
  net_gold numeric(20, 0) not null check (net_gold >= 0),
  fee_applied boolean not null default true,
  memo text,
  created_at timestamptz not null default now()
);

create index if not exists lostark_entries_occurred_on_idx
  on public.lostark_entries (occurred_on desc);

create index if not exists lostark_entries_direction_idx
  on public.lostark_entries (direction);

insert into public.accounts (name, is_mine)
select '내 계정', true
where not exists (select 1 from public.accounts where is_mine = true);

insert into public.accounts (name, is_mine)
select '아야짱 통장', false
where not exists (select 1 from public.accounts where is_mine = false);

alter table public.accounts disable row level security;
alter table public.ledger_entries disable row level security;
alter table public.cash_entries disable row level security;
alter table public.lostark_entries disable row level security;

grant usage on schema public to anon;
grant select, insert, update, delete on public.accounts to anon;
grant select, insert, update, delete on public.ledger_entries to anon;
grant select, insert, update, delete on public.cash_entries to anon;
grant select, insert, update, delete on public.lostark_entries to anon;

notify pgrst, 'reload schema';
