import type { CashEntry, CashCurrency, LostArkEntry } from '../types'
import { getWeekStartDate } from './calculations'

export type FinancePeriod = 'all' | 'week' | 'month' | 'year'

export type CashSummary = {
  balances: Record<CashCurrency, number>
  deposits: Record<CashCurrency, number>
  withdrawals: Record<CashCurrency, number>
}

export type LostArkSummary = {
  balanceGold: number
  depositGold: number
  withdrawalGold: number
  feeGold: number
}

export type CashPeriodGroup = CashSummary & {
  key: string
  label: string
  entries: CashEntry[]
}

export type LostArkPeriodGroup = LostArkSummary & {
  key: string
  label: string
  entries: LostArkEntry[]
}

const emptyCash = (): Record<CashCurrency, number> => ({ KRW: 0, JPY: 0 })

export function buildCashSummary(entries: CashEntry[]): CashSummary {
  const balances = emptyCash()
  const deposits = emptyCash()
  const withdrawals = emptyCash()

  for (const entry of entries) {
    const amount = Math.floor(Number(entry.amount_cash) || 0)
    if (entry.direction === 'deposit') {
      deposits[entry.currency] += amount
      balances[entry.currency] += amount
    } else {
      withdrawals[entry.currency] += amount
      balances[entry.currency] -= amount
    }
  }

  return { balances, deposits, withdrawals }
}

export function buildLostArkSummary(entries: LostArkEntry[]): LostArkSummary {
  let balanceGold = 0
  let depositGold = 0
  let withdrawalGold = 0
  let feeGold = 0

  for (const entry of entries) {
    const net = Math.floor(Number(entry.net_gold) || 0)
    const gross = Math.floor(Number(entry.gross_gold) || 0)
    if (entry.direction === 'deposit') {
      depositGold += net
      balanceGold += net
      feeGold += Math.max(0, gross - net)
    } else {
      withdrawalGold += net
      balanceGold -= net
    }
  }

  return { balanceGold, depositGold, withdrawalGold, feeGold }
}

export function applyLostArkFee(amount: number, feeApplied: boolean) {
  const cleanAmount = Math.max(0, Math.floor(amount || 0))
  return feeApplied ? Math.floor(cleanAmount * 0.95) : cleanAmount
}

export function groupCashByPeriod(entries: CashEntry[], period: FinancePeriod, resetDay: number): CashPeriodGroup[] {
  return groupByPeriod(entries, period, resetDay).map(group => ({
    ...buildCashSummary(group.entries),
    key: group.key,
    label: group.label,
    entries: group.entries,
  }))
}

export function groupLostArkByPeriod(entries: LostArkEntry[], period: FinancePeriod, resetDay: number): LostArkPeriodGroup[] {
  return groupByPeriod(entries, period, resetDay).map(group => ({
    ...buildLostArkSummary(group.entries),
    key: group.key,
    label: group.label,
    entries: group.entries,
  }))
}

function groupByPeriod<T extends { occurred_on: string; created_at: string }>(
  entries: T[],
  period: FinancePeriod,
  resetDay: number,
) {
  const groups = new Map<string, { key: string; label: string; entries: T[] }>()

  for (const entry of entries) {
    const key = getPeriodKey(entry.occurred_on, period, resetDay)
    const label = getPeriodLabel(entry.occurred_on, period, resetDay)
    const group = groups.get(key) ?? { key, label, entries: [] }
    group.entries.push(entry)
    groups.set(key, group)
  }

  return [...groups.values()]
    .map(group => ({
      ...group,
      entries: [...group.entries].sort((a, b) => {
        if (a.occurred_on !== b.occurred_on) return b.occurred_on.localeCompare(a.occurred_on)
        return b.created_at.localeCompare(a.created_at)
      }),
    }))
    .sort((a, b) => b.key.localeCompare(a.key))
}

function getPeriodKey(date: string, period: FinancePeriod, resetDay: number) {
  if (period === 'all') return 'all'
  if (period === 'week') return getWeekStartDate(date, resetDay)
  if (period === 'month') return date.slice(0, 7)
  return date.slice(0, 4)
}

function getPeriodLabel(date: string, period: FinancePeriod, resetDay: number) {
  if (period === 'all') return 'All'
  if (period === 'week') return getWeekStartDate(date, resetDay)
  if (period === 'month') return date.slice(0, 7)
  return date.slice(0, 4)
}
