export type EntryType =
  | 'boss_income'
  | 'girlfriend_income'
  | 'boss_cost_my'
  | 'boss_cost_girlfriend'
  | 'girlfriend_contribution'
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

export type EntryDirection = 'deposit' | 'withdraw'
export type CashGame = 'maple' | 'lostark'
export type CashCurrency = 'KRW' | 'JPY'
export type CashOwner = 'aya' | 'oppa'

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

export type CashEntry = {
  id: string
  occurred_on: string
  owner: CashOwner
  game: CashGame
  direction: EntryDirection
  currency: CashCurrency
  amount_cash: number
  memo: string | null
  created_at: string
}

export type CashEntryDraft = Omit<CashEntry, 'id' | 'created_at'>

export type LostArkEntry = {
  id: string
  occurred_on: string
  direction: EntryDirection
  gross_gold: number
  net_gold: number
  fee_applied: boolean
  memo: string | null
  created_at: string
}

export type LostArkEntryDraft = Omit<LostArkEntry, 'id' | 'created_at'>
