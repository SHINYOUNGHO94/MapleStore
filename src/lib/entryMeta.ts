import type { EntryType } from '../types'

export type EntryTone = 'income' | 'cost' | 'debt' | 'neutral'

export type EntryMeta = {
  value: EntryType
  tone: EntryTone
}

export const ENTRY_METAS: EntryMeta[] = [
  { value: 'boss_income',          tone: 'income'  },
  { value: 'boss_cost_my',         tone: 'cost'    },
  { value: 'boss_cost_girlfriend', tone: 'debt'    },
  { value: 'repay_girlfriend',     tone: 'income'  },
  { value: 'withdraw_my_share',    tone: 'neutral' },
  { value: 'adjustment',           tone: 'neutral' },
]

export function getEntryMeta(type: EntryType): EntryMeta {
  return ENTRY_METAS.find(m => m.value === type) ?? { value: type, tone: 'neutral' }
}
