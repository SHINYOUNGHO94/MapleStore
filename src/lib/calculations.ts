import type { Account, LedgerEntry } from '../types'
import { floorToMan } from './units'

export const DEFAULT_RESET_DAY = 4

export function todayInputValue() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

export function getWeekStartDate(dateValue: string, resetDay = DEFAULT_RESET_DAY) {
  const date = parseDateOnly(dateValue)
  const diff = (date.getDay() - resetDay + 7) % 7
  date.setDate(date.getDate() - diff)
  return toDateOnly(date)
}

export type Summary = {
  bossIncome: number
  bossCostFromMyMeso: number
  bossCostFromGirlfriendMeso: number
  girlfriendContribution: number
  repaidToGirlfriend: number
  withdrawnMyShare: number
  manualAdjustment: number
  totalBossCost: number
  netBossProfit: number
  debtToGirlfriend: number
  myClaimOnGirlfriendAccount: number
  myClaimByAccount: Record<string, number>
  thisWeekBossIncome: number
  thisWeekBossCost: number
  thisWeekNet: number
}

export type SettlementInfo = {
  claim: number
  debt: number
  netWorth: number
  repayable: number
  withdrawable: number
  remainingDebt: number
}

export function getSettlementInfo(summary: Summary, accountId?: string): SettlementInfo {
  const rawClaim = accountId
    ? summary.myClaimByAccount[accountId] ?? 0
    : summary.myClaimOnGirlfriendAccount
  const claim = Math.max(0, floorToMan(rawClaim))
  const debt = Math.max(0, floorToMan(summary.debtToGirlfriend))
  const repayable = Math.min(claim, debt)
  const withdrawable = Math.max(0, claim - debt)
  const remainingDebt = Math.max(0, debt - claim)

  return {
    claim,
    debt,
    netWorth: floorToMan(summary.myClaimOnGirlfriendAccount - summary.debtToGirlfriend),
    repayable,
    withdrawable,
    remainingDebt,
  }
}

export function buildSummary(entries: LedgerEntry[], accounts: Account[], resetDay = DEFAULT_RESET_DAY): Summary {
  const thisWeekStart = getWeekStartDate(todayInputValue(), resetDay)
  const mineAccountIds = new Set(accounts.filter(a => a.is_mine).map(a => a.id))
  const isGirlfriendAccount = (accountId: string) => !mineAccountIds.has(accountId)

  const s: Summary = {
    bossIncome: 0,
    bossCostFromMyMeso: 0,
    bossCostFromGirlfriendMeso: 0,
    girlfriendContribution: 0,
    repaidToGirlfriend: 0,
    withdrawnMyShare: 0,
    manualAdjustment: 0,
    totalBossCost: 0,
    netBossProfit: 0,
    debtToGirlfriend: 0,
    myClaimOnGirlfriendAccount: 0,
    myClaimByAccount: {},
    thisWeekBossIncome: 0,
    thisWeekBossCost: 0,
    thisWeekNet: 0,
  }

  const addClaim = (accountId: string, delta: number) => {
    s.myClaimByAccount[accountId] = (s.myClaimByAccount[accountId] ?? 0) + delta
    s.myClaimOnGirlfriendAccount += delta
  }

  for (const entry of entries) {
    const amount = floorToMan(Number(entry.amount_meso))
    const isThisWeek = entry.occurred_on >= thisWeekStart

    switch (entry.entry_type) {
      case 'boss_income':
        s.bossIncome += amount
        if (isThisWeek) s.thisWeekBossIncome += amount
        if (isGirlfriendAccount(entry.account_id)) addClaim(entry.account_id, amount)
        break

      case 'boss_cost_my':
        s.bossCostFromMyMeso += amount
        if (isThisWeek) s.thisWeekBossCost += amount
        if (isGirlfriendAccount(entry.account_id)) addClaim(entry.account_id, -amount)
        break

      case 'boss_cost_girlfriend':
        s.bossCostFromGirlfriendMeso += amount
        s.debtToGirlfriend += amount
        if (isThisWeek) s.thisWeekBossCost += amount
        break

      case 'girlfriend_contribution':
        s.girlfriendContribution += amount
        break

      case 'repay_girlfriend':
        s.repaidToGirlfriend += amount
        s.debtToGirlfriend -= amount
        if (isGirlfriendAccount(entry.account_id)) addClaim(entry.account_id, -amount)
        break

      case 'withdraw_my_share':
        s.withdrawnMyShare += amount
        if (isGirlfriendAccount(entry.account_id)) addClaim(entry.account_id, -amount)
        break

      case 'adjustment':
        s.manualAdjustment += amount
        break
    }
  }

  s.totalBossCost = s.bossCostFromMyMeso + s.bossCostFromGirlfriendMeso
  s.netBossProfit = s.bossIncome - s.totalBossCost + s.manualAdjustment
  s.thisWeekNet = s.thisWeekBossIncome - s.thisWeekBossCost

  return s
}

export type WeekGroup = {
  weekStart: string
  entries: LedgerEntry[]
  bossIncome: number
  bossCost: number
  net: number
}

export function groupByWeek(entries: LedgerEntry[], resetDay = DEFAULT_RESET_DAY): WeekGroup[] {
  const map = new Map<string, LedgerEntry[]>()
  for (const entry of entries) {
    const ws = getWeekStartDate(entry.occurred_on, resetDay)
    const bucket = map.get(ws)
    if (bucket) bucket.push(entry)
    else map.set(ws, [entry])
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([weekStart, weekEntries]) => {
      let bossIncome = 0
      let bossCost = 0
      for (const e of weekEntries) {
        const amt = floorToMan(Number(e.amount_meso))
        if (e.entry_type === 'boss_income') bossIncome += amt
        if (e.entry_type === 'boss_cost_my' || e.entry_type === 'boss_cost_girlfriend') bossCost += amt
      }
      return { weekStart, entries: weekEntries, bossIncome, bossCost, net: bossIncome - bossCost }
    })
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toDateOnly(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
