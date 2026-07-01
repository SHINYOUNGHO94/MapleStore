alter table public.ledger_entries
  drop constraint if exists ledger_entries_entry_type_check;

alter table public.ledger_entries
  add constraint ledger_entries_entry_type_check check (
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
  );

notify pgrst, 'reload schema';
