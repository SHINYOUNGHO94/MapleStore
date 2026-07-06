create table if not exists public.cash_entries (
  id uuid primary key default gen_random_uuid(),
  occurred_on date not null,
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

alter table public.cash_entries disable row level security;
alter table public.lostark_entries disable row level security;

grant select, insert, update, delete on public.cash_entries to anon;
grant select, insert, update, delete on public.lostark_entries to anon;

notify pgrst, 'reload schema';
