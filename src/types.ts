export type EntryType =
  | 'boss_income'
  | 'girlfriend_income'
  | 'boss_cost_my'
  | 'boss_cost_girlfriend'
  | 'repay_girlfriend'
  | 'withdraw_my_share'
  | 'adjustment'

export type Account = {
  id: string
  name: string
  is_mine: boolean
  balance_meso: number
  balance_updated_at: string | null
  created_at: string
}

export type AccountDraft = Pick<Account, 'name' | 'is_mine'>

export type LedgerEntry = {
  id: string
  occurred_on: string
  entry_type: EntryType
  account_id: string
  amount_meso: number
  boss_name: string | null
  memo: string | null
  created_at: string
}

export type LedgerEntryDraft = Omit<LedgerEntry, 'id' | 'created_at'>
